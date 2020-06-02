import { range, sum, zip } from "d3-array";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import ndarray from "ndarray";
import { ReadonlyKeys } from "utility-types";

import { PlannedReleases } from "../impact-dashboard/EpidemicModelContext";
import {
  getAllValues,
  getColView,
  getRowView,
  setRowValues,
} from "./matrixUtils";

interface SimulationInputs {
  facilityDormitoryPct: number;
}

export interface CurveProjectionInputs extends SimulationInputs {
  ageGroupPopulations: number[];
  numDays: number;
  ageGroupInitiallyInfected: number[];
  facilityOccupancyPct: number;
  plannedReleases?: PlannedReleases;
  populationTurnover: number;
  rateOfSpreadCells: number;
  rateOfSpreadDorms: number;
}

interface SingleDayInputs {
  pFatalityRate: number;
  populationAdjustment: number;
  priorSimulation: number[];
  rateOfSpreadCells: number;
  rateOfSpreadDorms: number;
  simulateStaff: boolean;
  totalInfectious: number;
  totalPopulation: number;
  totalSusceptibleIncarcerated: number;
  pSevereCase: number;
}

export enum seirIndex {
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

export const seirIndexList = Object.keys(seirIndex)
  .filter((k) => typeof seirIndex[k as any] === "number" && k !== "__length")
  // these should all be numbers anyway but this extra cast makes typescript happy
  .map((k) => parseInt(seirIndex[k as any]));

export type SeirCompartmentKeys = Exclude<
  ReadonlyKeys<typeof seirIndex>,
  "__length"
>;

export enum ageGroupIndex {
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
// factor for inferring exposure based on confirmed cases
const ratioExposedToInfected = dIncubation / dInfectious;
// factor for estimating population adjustment based on expected turnover
const populationAdjustmentRatio = 0.0879;
// Distribution of initial infected cases, based on curve ratios
const pInitiallyInfectious = 0.611;
const pInitiallyMild = 0.231;
const pInitiallySevere = 0.054;
const pInitiallyHospitalized = 0.043;
const pInitiallyMildRecovered = 0.057;
const pInitiallySevereRecovered = 0.004;

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
    populationAdjustment,
    totalSusceptibleIncarcerated,
    pSevereCase,
  } = inputs;

  const alpha = 1 / dIncubation;
  const betaCells = rateOfSpreadCells / dInfectious;
  const betaDorms = rateOfSpreadDorms / dInfectious;
  const gamma = 1 / dInfectious;

  const pMildCase = 1 - pSevereCase;

  const facilityCellsPct = 1 - facilityDormitoryPct;

  let [
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
      // incarcerated population adjustments affect susceptibility and exposure
      // for the incarcerated, but not staff

      susceptible += totalSusceptibleIncarcerated
        ? populationAdjustment * (susceptible / totalSusceptibleIncarcerated)
        : 0;
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

export const adjustPopulations = ({
  ageGroupPopulations,
  populationTurnover,
}: {
  ageGroupPopulations: CurveProjectionInputs["ageGroupPopulations"];
  populationTurnover: number;
}): number[] => {
  const adjustRate = populationTurnover * populationAdjustmentRatio;

  return ageGroupPopulations.map((pop, i) =>
    i === ageGroupIndex.staff ? pop : pop + pop * adjustRate,
  );
};

export function getAllBracketCurves(inputs: CurveProjectionInputs) {
  let {
    ageGroupInitiallyInfected,
    ageGroupPopulations,
    facilityDormitoryPct,
    numDays,
    plannedReleases,
    populationTurnover,
    rateOfSpreadCells,
    rateOfSpreadDorms,
  } = inputs;

  // 3d array. D1 = SEIR compartment. D2 = day. D3 = age bracket
  const projectionGrid = ndarray(
    new Array(seirIndexList.length * numDays * ageGroupIndex.__length).fill(0),
    [seirIndexList.length, numDays, ageGroupIndex.__length],
  );

  const updateProjectionDay = (day: number, data: ndarray) => {
    range(data.shape[0]).forEach((bracket) => {
      range(data.shape[1]).forEach((compartment) => {
        projectionGrid.set(
          compartment,
          day,
          bracket,
          data.get(bracket, compartment),
        );
      });
    });
  };

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

  // source: Centers for Disease Control,
  // https://www.cdc.gov/mmwr/volumes/69/wr/mm6912e2.htm#T1_down
  // we use the average of the range provided for each group
  const ageGroupHospitalizationRates: number[] = [];
  ageGroupHospitalizationRates[ageGroupIndex.ageUnknown] = 0.2605;
  ageGroupHospitalizationRates[ageGroupIndex.age0] = 0.0205;
  ageGroupHospitalizationRates[ageGroupIndex.age20] = 0.1755;
  ageGroupHospitalizationRates[ageGroupIndex.age45] = 0.2475;
  ageGroupHospitalizationRates[ageGroupIndex.age55] = 0.253;
  ageGroupHospitalizationRates[ageGroupIndex.age65] = 0.3605;
  ageGroupHospitalizationRates[ageGroupIndex.age75] = 0.446;
  ageGroupHospitalizationRates[ageGroupIndex.age85] = 0.508;
  ageGroupHospitalizationRates[ageGroupIndex.staff] = 0.2605;

  // adjust population figures based on expected turnover
  ageGroupPopulations = adjustPopulations({
    ageGroupPopulations,
    populationTurnover,
  });
  const totalPopulationByDay = new Array(numDays);
  totalPopulationByDay[0] = sum(ageGroupPopulations);

  // initialize the base daily state
  // each age group is a single row
  // each SEIR bucket is a single column
  const singleDayState = ndarray(
    Array(ageGroupIndex.__length * seirIndex.__length).fill(0),
    [ageGroupIndex.__length, seirIndex.__length],
  );

  // assign people to initial states
  zip(ageGroupPopulations, ageGroupInitiallyInfected).forEach(
    ([pop, cases], index) => {
      // distribute cases across compartments proportionally

      const infectious = cases * pInitiallyInfectious;
      // exposed is related to the number of infectious
      // but it can't be more than the total uninfected population
      const exposed = Math.min(
        infectious * ratioExposedToInfected,
        pop - cases,
      );

      singleDayState.set(index, seirIndex.susceptible, pop - cases - exposed);
      singleDayState.set(index, seirIndex.exposed, exposed);
      singleDayState.set(index, seirIndex.infectious, infectious);
      singleDayState.set(index, seirIndex.mild, cases * pInitiallyMild);
      singleDayState.set(index, seirIndex.severe, cases * pInitiallySevere);
      singleDayState.set(
        index,
        seirIndex.hospitalized,
        cases * pInitiallyHospitalized,
      );
      singleDayState.set(
        index,
        seirIndex.mildRecovered,
        cases * pInitiallyMildRecovered,
      );
      singleDayState.set(
        index,
        seirIndex.severeRecovered,
        cases * pInitiallySevereRecovered,
      );
    },
  );

  // index expected population adjustments by day;
  const today = Date.now();
  const expectedPopulationChanges = Array(numDays).fill(0);
  plannedReleases?.forEach(({ date, count }) => {
    // skip incomplete records
    if (!count || date === undefined) {
      return;
    }
    const dateIndex = differenceInCalendarDays(date, today);
    if (dateIndex < expectedPopulationChanges.length) {
      expectedPopulationChanges[dateIndex] -= count;
    }
  });

  // initialize the output with today's data
  // and start the projections with tomorrow
  updateProjectionDay(0, singleDayState);
  let day = 1;
  while (day < numDays) {
    // each day's projection needs the sum of all infectious projections so far
    const totalInfectious = sum(
      getAllValues(getColView(singleDayState, seirIndex.infectious)),
    );
    const totalSusceptibleIncarcerated = sum(
      getAllValues(getColView(singleDayState, seirIndex.susceptible)).filter(
        (v, i) => i !== ageGroupIndex.staff,
      ),
    );

    // slightly counterintuitive perhaps, but we need prior day's
    // total population to go along with prior day's data
    const totalPopulation = totalPopulationByDay[day - 1];
    // update the age group SEIR matrix in place for this day
    ageGroupFatalityRates.forEach((rate, ageGroup) => {
      const projectionForAgeGroup = simulateOneDay({
        priorSimulation: getAllValues(getRowView(singleDayState, ageGroup)),
        totalPopulation,
        totalInfectious,
        rateOfSpreadCells,
        rateOfSpreadDorms,
        pFatalityRate: rate,
        pSevereCase: ageGroupHospitalizationRates[ageGroup],
        facilityDormitoryPct,
        simulateStaff: ageGroup === ageGroupIndex.staff,
        populationAdjustment: expectedPopulationChanges[day],
        totalSusceptibleIncarcerated,
      });
      setRowValues(singleDayState, ageGroup, projectionForAgeGroup);
    });

    updateProjectionDay(day, singleDayState);

    // update total population for today to account for any adjustments made;
    // the next day will depend on this
    totalPopulationByDay[day] =
      totalPopulation + expectedPopulationChanges[day];

    day++;
  }

  return { totalPopulationByDay, projectionGrid, expectedPopulationChanges };
}
