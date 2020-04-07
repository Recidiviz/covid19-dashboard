import { sum, zip } from "d3-array";
import ndarray from "ndarray";

import { RateOfSpread } from "../impact-dashboard/EpidemicModelContext";
import {
  getAllValues,
  getColView,
  getRowView,
  setRowValues,
} from "./matrixUtils";

interface SimulationInputs {
  facilityDormitoryPct: number;
}

interface CurveProjectionInputs {
  ageGroupPopulations: number[];
  numDays: number;
  ageGroupInitiallyInfected: number[];
  facilityOccupancyPct: number;
  rateOfSpreadFactor: RateOfSpread;
}

interface SingleDayInputs {
  totalPopulation: number;
  priorSimulation: number[];
  totalInfectious: number;
  pFatalityRate: number;
  rateOfSpreadCells: number;
  rateOfSpreadDorms: number;
  simulateStaff: boolean;
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

// model constants
// days from virus exposure to infectious/contagious state
const dIncubation = 2;
// days in infectious period
const dInfectious = 4.1;
// days from end of infectious period to end of virus
const dRecoveryMild = 9.9;
// days from end of infectious period to hospital admission
const dHospitalLag = 2.9;
// days from hospital admission to hospital release (non-fatality scenario)
const dHospitalRecovery = 22;
// days from hospital admission to deceased (fatality scenario)
const dHospitalFatality = 8.3;
// probability case will be severe enough for the hospital
const pSevereCase = 0.26;
// factor for inferring exposure based on confirmed cases
const ratioExposedToInfected = dIncubation / dInfectious;

function simulateOneDay(inputs: SimulationInputs & SingleDayInputs) {
  const {
    facilityDormitoryPct,
    pFatalityRate,
    priorSimulation,
    rateOfSpreadCells,
    rateOfSpreadDorms,
    simulateStaff,
    totalInfectious,
    totalPopulation,
  } = inputs;

  const alpha = 1 / dIncubation;
  const betaCells = rateOfSpreadCells / dInfectious;
  const betaDorms = rateOfSpreadDorms / dInfectious;
  const gamma = 1 / dInfectious;

  const pMildCase = 1 - pSevereCase;

  const facilityCellsPct = 1 - facilityDormitoryPct;

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

  // Compute the deltas from the bottom of the tree up, additions to the
  // leaf nodes are subtracted from their parent node as people flow
  // from the root to the leaves of the tree
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
    if (simulateStaff) {
      exposedDelta =
        Math.min(
          susceptible,
          (betaCells * totalInfectious * susceptible) / totalPopulation,
        ) -
        alpha * exposed;

      susceptibleDelta =
        0 - (betaCells * totalInfectious * susceptible) / totalPopulation;
    } else {
      exposedDelta =
        Math.min(
          susceptible,
          (facilityCellsPct * betaCells * totalInfectious * susceptible) /
            totalPopulation +
            (facilityDormitoryPct * betaDorms * totalInfectious * susceptible) /
              totalPopulation,
        ) -
        alpha * exposed;

      susceptibleDelta =
        0 -
        (facilityCellsPct * betaCells * totalInfectious * susceptible) /
          totalPopulation -
        (facilityDormitoryPct * betaDorms * totalInfectious * susceptible) /
          totalPopulation;
    }
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

function getCurveProjections(inputs: SimulationInputs & CurveProjectionInputs) {
  let {
    ageGroupInitiallyInfected,
    ageGroupPopulations,
    facilityDormitoryPct,
    facilityOccupancyPct,
    numDays,
    rateOfSpreadFactor,
  } = inputs;

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

  // calculate R0 adjusted for housing type and capacity
  let rateOfSpreadCells = R0Cells[rateOfSpreadFactor];
  const rateOfSpreadCellsAdjustment = 0.8; // magic constant
  rateOfSpreadCells =
    rateOfSpreadCells -
    (1 - facilityOccupancyPct) *
      (rateOfSpreadCells - rateOfSpreadCellsAdjustment);
  let rateOfSpreadDorms = R0Dorms[rateOfSpreadFactor];
  const rateOfSpreadDormsAdjustment = 1.7; // magic constant
  rateOfSpreadDorms =
    rateOfSpreadDorms -
    (1 - facilityOccupancyPct) *
      (rateOfSpreadDorms - rateOfSpreadDormsAdjustment);

  const totalPopulation = sum(ageGroupPopulations);

  // initialize the base daily state with just susceptible and infected pops.
  // each age group is a single row
  // each SEIR bucket is a single column
  const singleDayState = ndarray(
    Array(ageGroupIndex.__length * seirIndex.__length).fill(0),
    [ageGroupIndex.__length, seirIndex.__length],
  );

  // initially everyone is either susceptible, exposed, or infected
  zip(ageGroupPopulations, ageGroupInitiallyInfected).forEach(
    ([pop, cases], index) => {
      const exposed = cases * ratioExposedToInfected;
      singleDayState.set(index, seirIndex.exposed, exposed);
      singleDayState.set(index, seirIndex.infectious, cases);
      singleDayState.set(index, seirIndex.susceptible, pop - cases - exposed);
    },
  );

  const dailyIncarceratedProjections = [];
  const dailyStaffProjections = [];
  let day = 0;
  while (day < numDays) {
    const currentDayIncarceratedProjections = [];
    const currentDayStaffProjections = [];
    // each day's projection needs the sum of all infectious projections so far
    const totalInfectious = sum(
      getAllValues(getColView(singleDayState, seirIndex.infectious)),
    );
    // update the age group SEIR matrix in place for this day
    ageGroupFatalityRates.forEach((rate, rowIndex) => {
      const projectionForAgeGroup = simulateOneDay({
        priorSimulation: getAllValues(getRowView(singleDayState, rowIndex)),
        totalPopulation,
        totalInfectious,
        rateOfSpreadCells,
        rateOfSpreadDorms,
        pFatalityRate: rate,
        facilityDormitoryPct,
        simulateStaff: rowIndex === ageGroupIndex.staff,
      });
      setRowValues(singleDayState, rowIndex, projectionForAgeGroup);
    });

    // sum up each column to get the total daily projection for each SEIR bucket
    for (let colIndex = 0; colIndex < singleDayState.shape[1]; colIndex++) {
      const incarceratedValues = getAllValues(
        getColView(singleDayState, colIndex),
      );
      const [staffCount] = incarceratedValues.splice(ageGroupIndex.staff, 1);
      currentDayIncarceratedProjections.push(sum(incarceratedValues));
      currentDayStaffProjections.push(staffCount);
    }

    // push this day's data to a flat list of daily projections,
    // which we will build a new matrix from
    dailyIncarceratedProjections.push(...currentDayIncarceratedProjections);
    dailyStaffProjections.push(...currentDayStaffProjections);
    day++;
  }

  // this will produce a matrix with row = day and col = SEIR bucket
  return {
    incarcerated: ndarray(dailyIncarceratedProjections, [
      numDays,
      seirIndex.__length,
    ]),
    staff: ndarray(dailyStaffProjections, [numDays, seirIndex.__length]),
  };
}

export { ageGroupIndex, getCurveProjections, seirIndex };
