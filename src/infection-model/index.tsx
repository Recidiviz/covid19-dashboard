import { EpidemicModelInputs } from "../impact-dashboard/EpidemicModelContext";
import { getAllValues, getColView } from "./matrixUtils";
import { ageGroupIndex, getCurveProjections, seirIndex } from "./seir";

export function calculateCurves(inputs: EpidemicModelInputs) {
  const {
    age0,
    age20,
    age45,
    age55,
    age65,
    age75,
    age85,
    ageUnknown,
    confirmedCases,
    rateOfSpreadFactor,
    staff,
    totalIncarcerated,
    usePopulationSubsets,
  } = inputs;

  const numDays = 75;

  const ageGroupPopulations = Array(ageGroupIndex.__length).fill(0);
  if (usePopulationSubsets) {
    ageGroupPopulations[ageGroupIndex.age0] = age0;
    ageGroupPopulations[ageGroupIndex.age20] = age20;
    ageGroupPopulations[ageGroupIndex.age45] = age45;
    ageGroupPopulations[ageGroupIndex.age55] = age55;
    ageGroupPopulations[ageGroupIndex.age65] = age65;
    ageGroupPopulations[ageGroupIndex.age75] = age75;
    ageGroupPopulations[ageGroupIndex.age85] = age85;
    ageGroupPopulations[ageGroupIndex.ageUnknown] = ageUnknown;
    ageGroupPopulations[ageGroupIndex.staff] = staff;
  } else {
    ageGroupPopulations[ageGroupIndex.ageUnknown] = totalIncarcerated;
  }

  const curveData = getCurveProjections({
    ageGroupPopulations,
    initiallyInfected: confirmedCases || 0,
    numDays,
    rateOfSpreadFactor,
  });
  return {
    exposed: getAllValues(getColView(curveData, seirIndex.exposed)),
    infectious: getAllValues(getColView(curveData, seirIndex.infectious)),
    hospitalized: getAllValues(getColView(curveData, seirIndex.hospitalized)),
  };
}

export function estimatePeakHospitalUse(inputs: {
  incarceratedPopulation: number;
  R0: number;
  hospitalBedCapacity: number;
}) {
  const { incarceratedPopulation, R0, hospitalBedCapacity } = inputs;

  const curves = calculateCurves({
    usePopulationSubsets: false,
    totalIncarcerated: incarceratedPopulation,
    rateOfSpreadFactor: R0,
  });
  const bedsRequiredPerDay = curves.hospitalized;
  const peakRequirement = Math.max(...bedsRequiredPerDay);
  const peakUtilization = peakRequirement / hospitalBedCapacity;
  const peakDay = bedsRequiredPerDay.indexOf(peakRequirement) + 1;
  return { peakUtilization, peakDay };
}
