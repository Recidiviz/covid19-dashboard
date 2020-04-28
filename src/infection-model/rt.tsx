import { ascending } from "d3-array";
import { fromUnixTime } from "date-fns";
import mapValues from "lodash/mapValues";

import { getFacilityModelVersions } from "../database";
import { totalConfirmedCases } from "../impact-dashboard/EpidemicModelContext";
import { Facility } from "../page-multi-facility/types";

type RawRtRecord = {
  date: number; // timestamp
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
  dates: number[];
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
  const modelVersions = await getFacilityModelVersions({
    scenarioId: facility.scenarioId,
    facilityId: facility.id,
  });

  const cases: number[] = [];
  const dates: number[] = [];

  modelVersions.forEach((model) => {
    dates.push(model.observedAt.seconds);
    cases.push(totalConfirmedCases(model));
  });

  return { cases, dates };
};

export const cleanRtData = (rawData: RawRtData) => {
  return mapValues(rawData, (records) =>
    records
      .map(({ date, value }) => ({
        date: fromUnixTime(date),
        value,
      }))
      // ensure records are sorted chronologically
      .sort((a, b) => ascending(a.date, b.date)),
  );
};

export const getRtDataForFacility = async (
  facility: Facility,
): Promise<RtData> => {
  const { cases, dates } = await getRtInputsForFacility(facility);
  const fetchedData = await fetchRt({ dates, cases });
  return cleanRtData(fetchedData);
};
