import { range, sum } from "d3-array";
import ndarray from "ndarray";
import { Omit } from "utility-types";

import {
  calculateFacilityOccupancyPct,
  EpidemicModelInputs,
} from "../impact-dashboard/EpidemicModelContext";
import {
  adjustPopulations,
  ageGroupIndex,
  CurveProjectionInputs,
  getAllBracketCurves,
} from "./seir";

export const NUM_DAYS = 90;

export type CurveData = {
  incarcerated: ndarray;
  staff: ndarray;
};

export const isCurveData = (arg: CurveData | undefined): arg is CurveData => {
  return arg !== undefined;
};

export type CurveFunctionInputs = Omit<
  EpidemicModelInputs,
  "rateOfSpreadFactor"
> & {
  rateOfSpreadCells: number;
  rateOfSpreadDorms: number;
  facilityOccupancyPct: number;
};

function prepareAgeGroupPopulations({
  age0Population,
  age20Population,
  age45Population,
  age55Population,
  age65Population,
  age75Population,
  age85Population,
  ageUnknownPopulation,
  staffPopulation,
  totalIncarcerated,
  usePopulationSubsets,
}: CurveFunctionInputs): number[] {
  const ageGroupPopulations = Array(ageGroupIndex.__length).fill(0);
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
  } else {
    ageGroupPopulations[ageGroupIndex.ageUnknown] = totalIncarcerated || 0;
  }

  return ageGroupPopulations;
}

function prepareAgeGroupRecovered({
  age0Recovered,
  age20Recovered,
  age45Recovered,
  age55Recovered,
  age65Recovered,
  age75Recovered,
  age85Recovered,
  ageUnknownRecovered,
  staffRecovered,
}: CurveFunctionInputs): number[] {
  const ageGroupRecovered = Array(ageGroupIndex.__length).fill(0);
  ageGroupRecovered[ageGroupIndex.age0] = age0Recovered || 0;
  ageGroupRecovered[ageGroupIndex.age20] = age20Recovered || 0;
  ageGroupRecovered[ageGroupIndex.age45] = age45Recovered || 0;
  ageGroupRecovered[ageGroupIndex.age55] = age55Recovered || 0;
  ageGroupRecovered[ageGroupIndex.age65] = age65Recovered || 0;
  ageGroupRecovered[ageGroupIndex.age75] = age75Recovered || 0;
  ageGroupRecovered[ageGroupIndex.age85] = age85Recovered || 0;
  ageGroupRecovered[ageGroupIndex.ageUnknown] = ageUnknownRecovered || 0;
  ageGroupRecovered[ageGroupIndex.staff] = staffRecovered || 0;
  return ageGroupRecovered;
}

function prepareAgeGroupDeaths({
  age0Deaths,
  age20Deaths,
  age45Deaths,
  age55Deaths,
  age65Deaths,
  age75Deaths,
  age85Deaths,
  ageUnknownDeaths,
  staffDeaths,
}: CurveFunctionInputs): number[] {
  const ageGroupDeaths = Array(ageGroupIndex.__length).fill(0);
  ageGroupDeaths[ageGroupIndex.age0] = age0Deaths || 0;
  ageGroupDeaths[ageGroupIndex.age20] = age20Deaths || 0;
  ageGroupDeaths[ageGroupIndex.age45] = age45Deaths || 0;
  ageGroupDeaths[ageGroupIndex.age55] = age55Deaths || 0;
  ageGroupDeaths[ageGroupIndex.age65] = age65Deaths || 0;
  ageGroupDeaths[ageGroupIndex.age75] = age75Deaths || 0;
  ageGroupDeaths[ageGroupIndex.age85] = age85Deaths || 0;
  ageGroupDeaths[ageGroupIndex.ageUnknown] = ageUnknownDeaths || 0;
  ageGroupDeaths[ageGroupIndex.staff] = staffDeaths || 0;
  return ageGroupDeaths;
}

enum R0Cells {
  low = 2.4,
  moderate = 3,
  high = 3.7,
}

enum R0Dorms {
  low = 3,
  moderate = 5,
  high = 7,
}

export function curveInputsFromUserInputs(
  userInputs: EpidemicModelInputs,
): CurveFunctionInputs {
  const facilityOccupancyPct = calculateFacilityOccupancyPct(userInputs);
  const { rateOfSpreadFactor } = userInputs;

  // translate qualitative rate of spread factor into numbers
  let rateOfSpreadCells = R0Cells[rateOfSpreadFactor];
  let rateOfSpreadDorms = R0Dorms[rateOfSpreadFactor];

  // adjust rate of spread for housing type and capacity
  const rateOfSpreadCellsAdjustment = 0.8; // magic constant
  rateOfSpreadCells =
    rateOfSpreadCells -
    (1 - facilityOccupancyPct) *
      (rateOfSpreadCells - rateOfSpreadCellsAdjustment);

  const rateOfSpreadDormsAdjustment = 1.7; // magic constant
  rateOfSpreadDorms =
    rateOfSpreadDorms -
    (1 - facilityOccupancyPct) *
      (rateOfSpreadDorms - rateOfSpreadDormsAdjustment);

  const curveInputs = {
    ...userInputs,
    ...{ rateOfSpreadCells, rateOfSpreadDorms, facilityOccupancyPct },
  };
  delete curveInputs.rateOfSpreadFactor;
  return curveInputs;
}

export function curveInputsWithRt(
  userInputs: EpidemicModelInputs,
  rt?: number,
): CurveFunctionInputs | undefined {
  if (rt === undefined) {
    return;
  }
  const facilityOccupancyPct = calculateFacilityOccupancyPct(userInputs);

  // with Rt there is no distinction between these rates
  const rateOfSpreadValues = {
    rateOfSpreadCells: rt,
    rateOfSpreadDorms: rt,
  };
  const curveInputs = {
    ...userInputs,
    ...rateOfSpreadValues,
    facilityOccupancyPct,
  };
  delete curveInputs.rateOfSpreadFactor;
  return curveInputs;
}

function prepareCurveData(inputs: CurveFunctionInputs): CurveProjectionInputs {
  const {
    age0Cases,
    age20Cases,
    age45Cases,
    age55Cases,
    age65Cases,
    age75Cases,
    age85Cases,
    ageUnknownCases,
    confirmedCases,
    facilityDormitoryPct,
    facilityOccupancyPct,
    plannedReleases,
    populationTurnover,
    rateOfSpreadCells,
    rateOfSpreadDorms,
    staffCases,
    usePopulationSubsets,
  } = inputs;

  const numDays = NUM_DAYS;

  const ageGroupPopulations = prepareAgeGroupPopulations(inputs);
  const ageGroupInitiallyInfected = Array(ageGroupIndex.__length).fill(0);
  const ageGroupRecovered = prepareAgeGroupRecovered(inputs);
  const ageGroupDeaths = prepareAgeGroupRecovered(inputs);

  if (usePopulationSubsets) {
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
    ageGroupInitiallyInfected[ageGroupIndex.ageUnknown] = confirmedCases || 0;
  }

  return {
    ageGroupPopulations,
    ageGroupRecovered,
    ageGroupDeaths,
    ageGroupInitiallyInfected,
    facilityDormitoryPct,
    facilityOccupancyPct,
    numDays,
    plannedReleases,
    populationTurnover,
    rateOfSpreadCells,
    rateOfSpreadDorms,
  };
}

export function calculateCurves(
  inputs?: CurveFunctionInputs,
): CurveData | undefined {
  if (!inputs) return;

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

export function calculateAllCurves(inputs: CurveFunctionInputs) {
  return getAllBracketCurves(prepareCurveData(inputs));
}

export function getAdjustedTotalPopulation(inputs: CurveFunctionInputs) {
  let ageGroupPopulations = prepareAgeGroupPopulations(inputs);
  ageGroupPopulations = adjustPopulations({
    ageGroupPopulations,
    populationTurnover: inputs.populationTurnover,
  });
  return sum(ageGroupPopulations);
}

export function estimatePeakHospitalUse() {
  // TODO: this function is now broken by the latest model updates
  //  and the feature it powers is being rethought and possibly removed;
  // come back and fix this or trash it
  return {};
}
