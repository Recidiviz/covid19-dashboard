import { zip } from "d3-array";
import ndarray from "ndarray";

import { EpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import {
  EpidemicModelInputs,
  RateOfSpread,
} from "../impact-dashboard/EpidemicModelContext";
import { calculateCurves, CurveData } from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";
import { Facilities, Timestamp } from "../page-multi-facility/types";

const originalModelInput = () => {
  return {
    staffCases: 1,
    // TODO import this
    staffPopulation: 600,
    ageUnknownCases: 1,
    // TODO import this
    ageUnknownPopulation: 20000,
    populationTurnover: 0,
    facilityOccupancyPct: 1,
    facilityDormitoryPct: 0.15,
    rateOfSpreadFactor: "High" as RateOfSpread,
    plannedReleases: undefined,
  } as EpidemicModelInputs
};

export const originalFacility: Facilities = [
  {
    id: "",
    scenarioId: "",
    name: "",
    createdAt: { seconds: "", nanoseconds: "", toDate: () => "" },
    updatedAt: { seconds: "", nanoseconds: "", toDate: () => "" },
    systemType: "State Prison",
    modelInputs: originalModelInput(),
  },
];

function calculateCurveData(facilitiesInputs: EpidemicModelState[]) {
  return facilitiesInputs.map((facilityInput) => {
    return calculateCurves(facilityInput);
  });
}

function combineFacilitiesProjectionData(
  facilitiesProjectionData: CurveData[],
) {
  if (!facilitiesProjectionData.length) return ndarray([], []);
  const incarceratedData = facilitiesProjectionData
    .map((output) => output.incarcerated)
    .map((output) => output.data);
  const staffData = facilitiesProjectionData
    .map((output) => output.staff)
    .map((output) => output.data);
  const combinedData = zip(...incarceratedData, ...staffData);
  const summedData = combinedData.map((row) => {
    return row.reduce((sum, value) => {
      return (sum += value);
    }, 0);
  });
  return ndarray(summedData, [90, 9]);
}

export function getCurveChartData(facilitiesInputs: EpidemicModelState[]) {
  if (!facilitiesInputs.length)
    return {
      // NOTE: We should guard against this in the dashboard and remove
      // this default return from this function
      exposed: [],
      fatalities: [],
      hospitalized: [],
      infectious: [],
    };
  const facilitiesProjectionData = calculateCurveData(facilitiesInputs);
  const combinedData: ndarray = combineFacilitiesProjectionData(
    facilitiesProjectionData,
  );
  return {
    exposed: getAllValues(getColView(combinedData, seirIndex.exposed)),
    fatalities: getAllValues(getColView(combinedData, seirIndex.fatalities)),
    hospitalized: getAllValues(
      getColView(combinedData, seirIndex.hospitalized),
    ),
    infectious: getAllValues(getColView(combinedData, seirIndex.infectious)),
  };
}
