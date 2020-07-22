import { ascending } from "d3-array";
import {
  differenceInCalendarDays,
  formatISO,
  fromUnixTime,
  parseISO,
} from "date-fns";
import { has, mapValues, maxBy, minBy, pick } from "lodash";

import { RateOfSpreadType } from "../constants/EpidemicModel";
import { totalConfirmedCases } from "../impact-dashboard/EpidemicModelContext";
import {
  Facilities,
  Facility,
  RtDataMapping,
  RtValue,
} from "../page-multi-facility/types";

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

export type RtError = {
  error: string;
};

const isError = (obj: RawRtData | ErrorResponse): obj is ErrorResponse => {
  return (obj as ErrorResponse).error !== undefined;
};

export function isRtData(data: RtData | RtError | undefined): data is RtData {
  return has(data, "Rt") && has(data, "low90") && has(data, "high90");
}

export function isRtError(data: any): data is RtError {
  return has(data, "error");
}

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

const getRtInputsForFacility = (facility: Facility): RtInputs => {
  const cases: number[] = [];
  const dates: string[] = [];

  facility.modelVersions.forEach((model) => {
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
): Promise<RtValue> => {
  try {
    const { cases, dates } = getRtInputsForFacility(facility);
    const fetchedData = await fetchRt({ dates, cases });
    return cleanRtData(fetchedData);
  } catch (error) {
    return { error };
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

export const getPrevWeekRt = (rtRecords: RtRecord[]) => {
  const today = new Date();
  return maxBy(
    rtRecords.filter(
      (record) =>
        differenceInCalendarDays(today, record.date) >= 7 &&
        record.date != today,
    ),
    "date",
  );
};

export const rtSpreadType = (rtValue: number | RtError | undefined) => {
  if (isRtError(rtValue) || rtValue === undefined) {
    return RateOfSpreadType.Missing;
  } else if (rtValue > 1) {
    return RateOfSpreadType.Infectious;
  } else {
    return RateOfSpreadType.Controlled;
  }
};

export function getFacilitiesRtDataById(
  rtData: RtDataMapping | undefined,
  facilities: Facilities,
) {
  if (!rtData) return undefined;
  const facilityIds = facilities.map((f) => f.id);
  return pick(rtData, facilityIds);
}
