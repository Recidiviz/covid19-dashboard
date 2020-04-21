import { range, sum } from "d3-array";
import ndarray from "ndarray";

import { EpidemicModelInputs } from "../impact-dashboard/EpidemicModelContext";
import {
  ageGroupIndex,
  CurveProjectionInputs,
  getAllBracketCurves,
} from "./seir";

export type CurveData = {
  incarcerated: ndarray;
  staff: ndarray;
};

function prepareCurveData(inputs: EpidemicModelInputs): CurveProjectionInputs {
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
    populationTurnover,
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

  return {
    ageGroupPopulations,
    ageGroupInitiallyInfected,
    facilityDormitoryPct,
    facilityOccupancyPct,
    numDays,
    plannedReleases,
    populationTurnover,
    rateOfSpreadFactor,
  };
}

export function calculateCurves(inputs: EpidemicModelInputs): CurveData {
  const { projectionGrid } = getAllBracketCurves(prepareCurveData(inputs));

  // these will each produce a matrix with row = day and col = SEIR bucket,
  // collapsing all age brackets into a single sum
  const incarcerated = ndarray(
    new Array(projectionGrid.shape[0] * projectionGrid.shape[1]),
    [projectionGrid.shape[1], projectionGrid.shape[0]],
  );
  const staff = ndarray(
    new Array(projectionGrid.shape[0] * projectionGrid.shape[1]),
    [projectionGrid.shape[1], projectionGrid.shape[0]],
  );

  range(projectionGrid.shape[0]).forEach((compartment) =>
    range(projectionGrid.shape[1]).forEach((day) => {
      incarcerated.set(
        day,
        compartment,
        sum(
          range(projectionGrid.shape[2])
            .filter((i) => i !== ageGroupIndex.staff)
            .map((bracket) => projectionGrid.get(compartment, day, bracket)),
        ),
      );
      staff.set(
        day,
        compartment,
        projectionGrid.get(compartment, day, ageGroupIndex.staff),
      );
    }),
  );

  return {
    incarcerated,
    staff,
  };
}

export function calculateAllCurves(inputs: EpidemicModelInputs) {
  return getAllBracketCurves(prepareCurveData(inputs));
}

export function estimatePeakHospitalUse() {
  // TODO: this function is now broken by the latest model updates
  //  and the feature it powers is being rethought and possibly removed;
  // come back and fix this or trash it
  return {};
}
