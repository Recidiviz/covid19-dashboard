import { ascending } from "d3-array";
import { formatISO, fromUnixTime, parseISO } from "date-fns";
import { mapValues, orderBy, uniqBy } from "lodash";

import { getFacilityModelVersions } from "../database";
import { totalConfirmedCases } from "../impact-dashboard/EpidemicModelContext";
import { Facilities, Facility } from "../page-multi-facility/types";

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
  // TODO: it may be possible to do this filtering directly in the query
  // with a compound index, see #254 and replace this code if possible
  modelVersions = uniqBy(
    orderBy(
      modelVersions,
      ["observedAt", "updatedAt"],
      // uniqBy retains only the first item when it encounters duplicates,
      // so make sure the most recently updated one is first
      ["asc", "desc"],
    ),
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

export const getRtDataForFacilities = async (facilities: Facilities) => {
  return await Promise.all(
    facilities.map(async (facility) => {
      return await getRtDataForFacility(facility);
    }),
  );
};
