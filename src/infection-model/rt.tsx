import { ascending } from "d3-array";
import {
  differenceInCalendarDays,
  formatISO,
  fromUnixTime,
  parseISO,
} from "date-fns";
import { mapValues, maxBy, minBy, uniqBy } from "lodash";

import { RateOfSpreadType } from "../constants/EpidemicModel";
import { getFacilityModelVersions } from "../database";
import { totalConfirmedCases } from "../impact-dashboard/EpidemicModelContext";
import { Facility } from "../page-multi-facility/types";

type RawRtRecord = {
  date: string; // timestamp
  value: number;
};

type RawRtData = {
  Rt: RawRtRecord[];
  low90: RawRtRecord[];
  high90: RawRtRecord[];
};

type ErrorResponse = {
  error: string;
};

type RtInputs = {
  dates: string[];
  cases: number[];
};

export type RtRecord = {
  date: Date;
  value: number;
};

export type RtData = {
  Rt: RtRecord[];
  low90: RtRecord[];
  high90: RtRecord[];
};

const isError = (obj: RawRtData | ErrorResponse): obj is ErrorResponse => {
  return (obj as ErrorResponse).error !== undefined;
};

const getFetchUrl = () => {
  let url = "https://us-central1-c19-backend.cloudfunctions.net/calculate_rt";
  if (process.env.NODE_ENV !== "production") {
    url += "_development";
  }

  return url;
};

export async function fetchRt(requestData: RtInputs): Promise<RawRtData> {
  const resp = await fetch(getFetchUrl(), {
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const responseData = await resp.json();

  if (isError(responseData)) {
    throw new Error(responseData.error);
  }
  return responseData;
}

const getRtInputsForFacility = async (
  facility: Facility,
): Promise<RtInputs> => {
  let modelVersions = await getFacilityModelVersions({
    scenarioId: facility.scenarioId,
    facilityId: facility.id,
  });

  // inputs must contain no more than one record per day.
  // when we have multiples, filter out all but the most recently updated
  modelVersions = uniqBy(
    modelVersions,
    // make sure time doesn't enter into the uniqueness
    (record) => record.observedAt.toDateString(),
  );

  const cases: number[] = [];
  const dates: string[] = [];

  modelVersions.forEach((model) => {
    const seconds = model.observedAt.getTime() / 1000;

    dates.push(
      formatISO(fromUnixTime(seconds), {
        representation: "date",
      }),
    );

    cases.push(totalConfirmedCases(model));
  });

  return { cases, dates };
};

export const cleanRtData = (rawData: RawRtData) => {
  return mapValues(rawData, (records) =>
    records
      .map(({ date, value }) => ({
        date: parseISO(date),
        value,
      }))
      // ensure records are sorted chronologically
      .sort((a, b) => ascending(a.date, b.date)),
  );
};

export const getRtDataForFacility = async (
  facility: Facility,
): Promise<RtData | null> => {
  try {
    const { cases, dates } = await getRtInputsForFacility(facility);
    const fetchedData = await fetchRt({ dates, cases });
    return cleanRtData(fetchedData);
  } catch (error) {
    console.error(`Error fetching R(t) data for facility ${facility.id}:`);
    console.error(error);
    return null;
  }
};

export const getOldestRt = (rtRecords: RtRecord[]) => {
  return minBy(rtRecords, (rtRecord) => rtRecord.date);
};

export const getNewestRt = (rtRecords: RtRecord[]) => {
  return maxBy(rtRecords, (rtRecord) => rtRecord.date);
};

export const getDaysAgoRt = (rtRecords: RtRecord[], daysAgo: number) => {
  const today = new Date();
  return maxBy(
    rtRecords.filter(
      (record) => differenceInCalendarDays(today, record.date) >= daysAgo,
    ),
    "date",
  );
};

export const rtSpreadType = (rtValue: number | null | undefined) => {
  if (rtValue === null || rtValue === undefined) {
    return RateOfSpreadType.Missing;
  } else if (rtValue > 1) {
    return RateOfSpreadType.Infectious;
  } else {
    return RateOfSpreadType.Controlled;
  }
};
