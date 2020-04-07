import { zip } from "d3-array";

import { EpidemicModelInputs } from "../impact-dashboard/EpidemicModelContext";
import { getAllValues, getColView } from "./matrixUtils";
import { ageGroupIndex, getCurveProjections, seirIndex } from "./seir";

export function calculateCurves(inputs: EpidemicModelInputs) {
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
    ageGroupPopulations[ageGroupIndex.age0] = age0Population;
    ageGroupPopulations[ageGroupIndex.age20] = age20Population;
    ageGroupPopulations[ageGroupIndex.age45] = age45Population;
    ageGroupPopulations[ageGroupIndex.age55] = age55Population;
    ageGroupPopulations[ageGroupIndex.age65] = age65Population;
    ageGroupPopulations[ageGroupIndex.age75] = age75Population;
    ageGroupPopulations[ageGroupIndex.age85] = age85Population;
    ageGroupPopulations[ageGroupIndex.ageUnknown] = ageUnknownPopulation;
    ageGroupPopulations[ageGroupIndex.staff] = staffPopulation;

    ageGroupInitiallyInfected[ageGroupIndex.age0] = age0Cases;
    ageGroupInitiallyInfected[ageGroupIndex.age20] = age20Cases;
    ageGroupInitiallyInfected[ageGroupIndex.age45] = age45Cases;
    ageGroupInitiallyInfected[ageGroupIndex.age55] = age55Cases;
    ageGroupInitiallyInfected[ageGroupIndex.age65] = age65Cases;
    ageGroupInitiallyInfected[ageGroupIndex.age75] = age75Cases;
    ageGroupInitiallyInfected[ageGroupIndex.age85] = age85Cases;
    ageGroupInitiallyInfected[ageGroupIndex.ageUnknown] = ageUnknownCases;
    ageGroupInitiallyInfected[ageGroupIndex.staff] = staffCases;
  } else {
    ageGroupPopulations[ageGroupIndex.ageUnknown] = totalIncarcerated;
    ageGroupInitiallyInfected[ageGroupIndex.ageUnknown] = confirmedCases;
  }

  const curveData = getCurveProjections({
    ageGroupPopulations,
    ageGroupInitiallyInfected,
    facilityDormitoryPct,
    facilityOccupancyPct,
    numDays,
    rateOfSpreadFactor,
  });

  // for these curves we combine incarcerated and staff
  function combinePopulations(columnIndex: number) {
    return zip(
      getAllValues(getColView(curveData.incarcerated, columnIndex)),
      getAllValues(getColView(curveData.staff, columnIndex)),
    ).map(([incarcerated, staff]) => incarcerated + staff);
  }

  return {
    exposed: combinePopulations(seirIndex.exposed),
    infectious: combinePopulations(seirIndex.infectious),
    hospitalized: combinePopulations(seirIndex.hospitalized),
  };
}

export function estimatePeakHospitalUse() {
  // TODO: this function is now broken by the latest model updates
  //  and the feature it powers is being rethought and possibly removed;
  // come back and fix this or trash it
  return {};
}
