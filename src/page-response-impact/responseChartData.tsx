import { zip } from "d3-array";
import ndarray from "ndarray";

import { EpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import { RateOfSpread } from "../impact-dashboard/EpidemicModelContext";
import {
  calculateCurves,
  CurveData,
  CurveFunctionInputs,
} from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";
import { Facilities } from "../page-multi-facility/types";

const NUM_DAYS = 90;
const NUM_SEIR_CATEGORIES = 9;

interface SystemWideData {
  staffPopulation: number;
  prisonPopulation: number;
  hospitalBeds: number;
}

function originalEpidemicModelInputs(systemWideData: SystemWideData) {
  const { staffPopulation, prisonPopulation } = systemWideData;
  return {
    staffCases: 1,
    staffPopulation: staffPopulation,
    ageUnknownCases: 1,
    ageUnknownPopulation: prisonPopulation,
    populationTurnover: 0,
    facilityOccupancyPct: 1,
    facilityDormitoryPct: 0.15,
    rateOfSpreadFactor: RateOfSpread.high,
    plannedReleases: undefined,
    observedAt: new Date(),
    updatedAt: new Date(),
  };
}

export const originalProjection = (systemWideData: SystemWideData) => {
  return [
    {
      id: "",
      scenarioId: "",
      name: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      systemType: "State Prison",
      modelInputs: originalEpidemicModelInputs(systemWideData),
    },
  ] as Facilities;
};

export function getSystemWideSums(modelInputs: EpidemicModelState[]) {
  let sums = {
    hospitalBeds: 0,
    staffPopulation: 0,
  };
  modelInputs.forEach((input) => {
    sums.hospitalBeds += input.hospitalBeds || 0;
    sums.staffPopulation += input.staffPopulation || 0;
    return sums;
  });
  return sums;
}

function calculateCurveData(facilitiesInputs: CurveFunctionInputs[]) {
  return facilitiesInputs.map((facilityInput) => {
    return calculateCurves(facilityInput);
  });
}

function combineFacilitiesProjectionData(
  facilitiesProjectionData: CurveData[],
) {
  if (!facilitiesProjectionData.length) return ndarray([], []);
  const incarceratedData = facilitiesProjectionData.map(
    (output) => output.incarcerated.data,
  );
  const staffData = facilitiesProjectionData.map((output) => output.staff.data);
  const combinedData = zip(...incarceratedData, ...staffData);
  const summedData = combinedData.map((row) => {
    return row.reduce((sum, value) => {
      return (sum += value);
    }, 0);
  });
  return ndarray(summedData, [NUM_DAYS, NUM_SEIR_CATEGORIES]);
}

export function getCurveChartData(facilitiesInputs: CurveFunctionInputs[]) {
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
