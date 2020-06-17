import { zip } from "d3-array";
import ndarray from "ndarray";

import {
  EpidemicModelState,
  getLocaleDefaults,
} from "../impact-dashboard/EpidemicModelContext";
import { RateOfSpread } from "../impact-dashboard/EpidemicModelContext";
import { countCasesForDay } from "../impact-dashboard/ImpactProjectionTableContainer";
import {
  calculateCurves,
  CurveData,
  CurveFunctionInputs,
  isCurveData,
} from "../infection-model";
import { NUM_DAYS } from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";
import { LocaleData } from "../locale-data-context";
import { Facilities } from "../page-multi-facility/types";

export type SystemWideData = {
  baselinePopulationDate: Date;
  hospitalBeds: number;
  staffPopulation: number;
  staffCases: number;
  age0Cases: number;
  age20Cases: number;
  age45Cases: number;
  age55Cases: number;
  age65Cases: number;
  age75Cases: number;
  age85Cases: number;
  ageUnknownCases: number;
  incarceratedPopulation: number;
};

function originalEpidemicModelInputs(systemWideData: SystemWideData) {
  return {
    ...systemWideData,
    ageUnknownPopulation: systemWideData.incarceratedPopulation,
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
    age0Cases: 0,
    age20Cases: 0,
    age45Cases: 0,
    age55Cases: 0,
    age65Cases: 0,
    age75Cases: 0,
    age85Cases: 0,
    ageUnknownCases: 0,
  } as SystemWideData;

  modelInputs.reduce((sum: SystemWideData, input: any) => {
    sum.hospitalBeds += input.hospitalBeds || 0;
    sum.staffPopulation += input.staffPopulation || 0;
    sum.staffCases += input.staffCases || 0;
    sum.age0Cases += input.age0Cases || 0;
    sum.age20Cases += input.age20Cases || 0;
    sum.age45Cases += input.age45Cases || 0;
    sum.age55Cases += input.age55Cases || 0;
    sum.age65Cases += input.age65Cases || 0;
    sum.age75Cases += input.age75Cases || 0;
    sum.age85Cases += input.age85Casess || 0;
    sum.ageUnknownCases += input.ageUnknownCases || 0;
    return sum;
  }, sums);
  return sums;
}

export function calculateCurveData(facilitiesInputs: CurveFunctionInputs[]) {
  return facilitiesInputs.map((facilityInput) => {
    return calculateCurves(facilityInput);
  });
}

export function combineFacilitiesProjectionData(
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
  return ndarray(summedData, [NUM_DAYS, seirIndex.__length]);
}

function getCaseCount(combinedData: ndarray<number>) {
  const cases = [];
  for (let day = 0; day < combinedData.shape[0]; ++day) {
    const caseCountForDay = countCasesForDay(combinedData, day);
    cases.push(caseCountForDay);
  }
  return cases;
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
      cases: [],
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
    cases: getCaseCount(combinedData),
  };
}
