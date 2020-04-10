import ndarray from "ndarray";

import { EpidemicModelInputs } from "../impact-dashboard/EpidemicModelContext";
import { ageGroupIndex, getCurveProjections } from "./seir";

export type CurveData = {
  incarcerated: ndarray;
  staff: ndarray;
};

export function calculateCurves(inputs: EpidemicModelInputs): CurveData {
  const {
    age0Cases,
    age0Population,
    age20Cases,
    age20Population,
    age45Cases,
    age45Population,
    age55Cases,
    age55Population,
    age65Cases,
    age65Population,
    age75Cases,
    age75Population,
    age85Cases,
    age85Population,
    ageUnknownCases,
    ageUnknownPopulation,
    confirmedCases,
    facilityDormitoryPct,
    facilityOccupancyPct,
    plannedReleases,
    rateOfSpreadFactor,
    staffCases,
    staffPopulation,
    totalIncarcerated,
    usePopulationSubsets,
  } = inputs;

  const numDays = 75;

  const ageGroupPopulations = Array(ageGroupIndex.__length).fill(0);
  const ageGroupInitiallyInfected = Array(ageGroupIndex.__length).fill(0);
  if (usePopulationSubsets) {
    ageGroupPopulations[ageGroupIndex.age0] = age0Population || 0;
    ageGroupPopulations[ageGroupIndex.age20] = age20Population || 0;
    ageGroupPopulations[ageGroupIndex.age45] = age45Population || 0;
    ageGroupPopulations[ageGroupIndex.age55] = age55Population || 0;
    ageGroupPopulations[ageGroupIndex.age65] = age65Population || 0;
    ageGroupPopulations[ageGroupIndex.age75] = age75Population || 0;
    ageGroupPopulations[ageGroupIndex.age85] = age85Population || 0;
    ageGroupPopulations[ageGroupIndex.ageUnknown] = ageUnknownPopulation || 0;
    ageGroupPopulations[ageGroupIndex.staff] = staffPopulation || 0;

    ageGroupInitiallyInfected[ageGroupIndex.age0] = age0Cases || 0;
    ageGroupInitiallyInfected[ageGroupIndex.age20] = age20Cases || 0;
    ageGroupInitiallyInfected[ageGroupIndex.age45] = age45Cases || 0;
    ageGroupInitiallyInfected[ageGroupIndex.age55] = age55Cases || 0;
    ageGroupInitiallyInfected[ageGroupIndex.age65] = age65Cases || 0;
    ageGroupInitiallyInfected[ageGroupIndex.age75] = age75Cases || 0;
    ageGroupInitiallyInfected[ageGroupIndex.age85] = age85Cases || 0;
    ageGroupInitiallyInfected[ageGroupIndex.ageUnknown] = ageUnknownCases || 0;
    ageGroupInitiallyInfected[ageGroupIndex.staff] = staffCases || 0;
  } else {
    ageGroupPopulations[ageGroupIndex.ageUnknown] = totalIncarcerated || 0;
    ageGroupInitiallyInfected[ageGroupIndex.ageUnknown] = confirmedCases || 0;
  }

  return getCurveProjections({
    ageGroupPopulations,
    ageGroupInitiallyInfected,
    facilityDormitoryPct,
    facilityOccupancyPct,
    numDays,
    plannedReleases,
    rateOfSpreadFactor,
  });
}

export function estimatePeakHospitalUse() {
  // TODO: this function is now broken by the latest model updates
  //  and the feature it powers is being rethought and possibly removed;
  // come back and fix this or trash it
  return {};
}
