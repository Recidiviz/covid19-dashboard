import { zip } from "d3-array";
import ndarray from "ndarray";

import {
  EpidemicModelState,
  getLocaleDefaults,
} from "../impact-dashboard/EpidemicModelContext";
import {
  RateOfSpread,
  totalConfirmedCases,
} from "../impact-dashboard/EpidemicModelContext";
import {
  calculateCurves,
  CurveData,
  CurveFunctionInputs,
  curveInputsFromUserInputs,
  isCurveData,
} from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";
import { LocaleData } from "../locale-data-context";
import { Facilities } from "../page-multi-facility/types";

const NUM_DAYS = 90;
const NUM_SEIR_CATEGORIES = 9;

export type SystemWideData = {
  staffPopulation: number;
  staffCases: number;
  incarceratedPopulation: number;
  incarceratedCases: number;
  hospitalBeds: number;
};

export function getModelInputs(
  facilities: Facilities,
  localeDataSource: LocaleData,
) {
  return facilities.map((facility) => {
    const modelInputs = facility.modelInputs;
    return {
      ...modelInputs,
      ...getLocaleDefaults(
        localeDataSource,
        modelInputs.stateCode,
        modelInputs.countyName,
      ),
    };
  });
}

export function getCurveInputs(modelInputs: EpidemicModelState[]) {
  return modelInputs.map((modelInput) => {
    return curveInputsFromUserInputs(modelInput);
  });
}

function originalEpidemicModelInputs(systemWideData: SystemWideData) {
  const {
    staffPopulation,
    staffCases,
    incarceratedPopulation,
    incarceratedCases,
  } = systemWideData;
  return {
    staffCases: staffCases,
    staffPopulation: staffPopulation,
    ageUnknownCases: incarceratedCases,
    ageUnknownPopulation: incarceratedPopulation,
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
    staffCases: 0,
    incarceratedCases: 0,
  };
  modelInputs.forEach((input) => {
    sums.hospitalBeds += input.hospitalBeds || 0;
    sums.staffPopulation += input.staffPopulation || 0;
    sums.staffCases += input.staffCases || 0;
    sums.incarceratedCases += totalConfirmedCases(input) || 0;
    return sums;
  });
  return sums;
}

export function calculateCurveData(facilitiesInputs: CurveFunctionInputs[]) {
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
    facilitiesProjectionData.filter(isCurveData),
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
