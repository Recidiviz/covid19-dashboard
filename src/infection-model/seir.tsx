import { sum } from "d3";
import ndarray from "ndarray";

import {
  getAllValues,
  getColView,
  getRowView,
  setRowValues,
} from "./matrixUtils";

interface SimulationInputs {
  rateOfSpreadFactor: number;
}

interface CurveProjectionInputs {
  ageGroupPopulations: number[];
  numDays: number;
  initiallyInfected: number;
}

interface SingleDayInputs {
  totalPopulation: number;
  priorSimulation: number[];
  totalInfectious: number;
  pFatalityRate: number;
}

enum seirIndex {
  susceptible,
  exposed,
  infectious,
  mild,
  severe,
  hospitalized,
  mildRecovered,
  severeRecovered,
  fatalities,
  __length,
}

enum ageGroupIndex {
  ageUnknown,
  age0,
  age20,
  age45,
  age55,
  age65,
  age75,
  age85,
  staff,
  __length,
}

function simulateOneDay(inputs: SimulationInputs & SingleDayInputs) {
  const {
    priorSimulation,
    totalPopulation,
    rateOfSpreadFactor,
    totalInfectious,
    pFatalityRate,
  } = inputs;
  // default constants
  // D_incubation: [float] days from virus exposure to infectious/contagious state
  const dIncubation = 2;
  // D_infectious: [float] days in infectious period
  const dInfectious = 4.1;
  // D_recovery_mild: [float] days from end of infectious period to end of virus
  const dRecoveryMild = 9.9;
  // D_hospital_lag: [float] days from end of infectious period to hospital admission
  const dHospitalLag = 2.9;
  // D_hospital_recovery: [integer] days from hospital admission to hospital release (non-fatality scenario)
  const dHospitalRecovery = 22;
  // D_hospital_fatality: [float] days from hospital admission to deceased (fatality scenario)
  const dHospitalFatality = 8.3;
  // P_severe_case: [float] probability case will be severe enough for the hospital
  const pSevereCase = 0.26;

  const alpha = 1 / dIncubation;
  const beta = rateOfSpreadFactor / dInfectious;
  const gamma = 1 / dInfectious;

  const pMildCase = 1 - pSevereCase;

  const [
    susceptible,
    exposed,
    infectious,
    mild,
    severe,
    hospitalized,
    mildRecovered,
    severeRecovered,
    fatalities,
  ] = priorSimulation;

  // Compute the deltas from the bottom of the tree up, additions to the leaf nodes are subtracted from their parent node as people flow from the root to the leaves of the tree
  const mildRecoveredData = mild / dRecoveryMild;
  const fatalitiesDelta =
    ((pFatalityRate / pSevereCase) * hospitalized) / dHospitalFatality;
  const severeRecoveredDelta =
    ((1 - pFatalityRate / pSevereCase) * hospitalized) / dHospitalRecovery;

  const mildDelta = gamma * pMildCase * infectious - mild / dRecoveryMild;
  const severeDelta = gamma * pSevereCase * infectious - severe / dHospitalLag;
  const hospitalizedDelta =
    severe / dHospitalLag - fatalitiesDelta - severeRecoveredDelta;

  const infectiousDelta = alpha * exposed - gamma * infectious;

  let exposedDelta;
  let susceptibleDelta;
  if (totalPopulation === 0) {
    exposedDelta = 0;
    susceptibleDelta = 0;
  } else {
    exposedDelta =
      Math.min(
        susceptible,
        (beta * totalInfectious * susceptible) / totalPopulation,
      ) -
      alpha * exposed;
    susceptibleDelta =
      (-beta * totalInfectious * susceptible) / totalPopulation;
  }

  return [
    Math.max(susceptible + susceptibleDelta, 0),
    exposed + exposedDelta,
    infectious + infectiousDelta,
    mild + mildDelta,
    severe + severeDelta,
    hospitalized + hospitalizedDelta,
    mildRecovered + mildRecoveredData,
    severeRecovered + severeRecoveredDelta,
    fatalities + fatalitiesDelta,
  ];
}

function getCurveProjections(inputs: SimulationInputs & CurveProjectionInputs) {
  let {
    ageGroupPopulations,
    rateOfSpreadFactor,
    numDays,
    initiallyInfected,
  } = inputs;

  // this number can't be zero;
  // if it's missing, substitute a conservative assumption
  initiallyInfected = initiallyInfected || 1;

  const ageGroupFatalityRates = [];
  ageGroupFatalityRates[ageGroupIndex.ageUnknown] = 0.026;
  ageGroupFatalityRates[ageGroupIndex.age0] = 0;
  ageGroupFatalityRates[ageGroupIndex.age20] = 0.0015;
  ageGroupFatalityRates[ageGroupIndex.age45] = 0.0065;
  ageGroupFatalityRates[ageGroupIndex.age55] = 0.02;
  ageGroupFatalityRates[ageGroupIndex.age65] = 0.038;
  ageGroupFatalityRates[ageGroupIndex.age75] = 0.074;
  ageGroupFatalityRates[ageGroupIndex.age85] = 0.1885;
  ageGroupFatalityRates[ageGroupIndex.staff] = 0.026;

  // initialize the base daily state with just susceptible and infected pops.
  // each age group is a single row
  // each SEIR bucket is a single column
  const singleDayState = ndarray(
    Array(ageGroupIndex.__length * seirIndex.__length).fill(0),
    [ageGroupIndex.__length, seirIndex.__length],
  );

  // initially everyone is susceptible
  ageGroupPopulations.forEach((pop, index) => {
    singleDayState.set(index, seirIndex.susceptible, pop);
  });
  // anyone initially infected is moved from susceptible of unknown age
  // TODO: what if this value is zero? how do we fall back?
  singleDayState.set(
    ageGroupIndex.ageUnknown,
    seirIndex.infectious,
    initiallyInfected,
  );
  singleDayState.set(
    ageGroupIndex.ageUnknown,
    seirIndex.susceptible,
    singleDayState.get(0, seirIndex.susceptible) - initiallyInfected,
  );

  const dailySEIRProjections = [];
  let day = 0;
  while (day < numDays) {
    const currentDayProjections = [];
    // each day's projection needs the sum of all infectious projections so far
    const totalInfectious = sum(
      getAllValues(getColView(singleDayState, seirIndex.infectious)),
    );
    // update the age group SEIR matrix in place for this day
    ageGroupFatalityRates.forEach((rate, rowIndex) => {
      const projectionForAgeGroup = simulateOneDay({
        priorSimulation: getAllValues(getRowView(singleDayState, rowIndex)),
        totalPopulation: sum(ageGroupPopulations),
        totalInfectious,
        rateOfSpreadFactor,
        pFatalityRate: rate,
      });
      setRowValues(singleDayState, rowIndex, projectionForAgeGroup);
    });

    // sum up each column to get the total daily projection for each SEIR bucket
    for (let colIndex = 0; colIndex < singleDayState.shape[1]; colIndex++) {
      currentDayProjections.push(
        sum(getAllValues(getColView(singleDayState, colIndex))),
      );
    }

    // push this day's data to a flat list of daily projections,
    // which we will build a new matrix from
    dailySEIRProjections.push(...currentDayProjections);
    day++;
  }

  // this will produce a matrix with row = day and col = SEIR bucket
  return ndarray(dailySEIRProjections, [numDays, seirIndex.__length]);
}

export { ageGroupIndex, getCurveProjections, seirIndex };
