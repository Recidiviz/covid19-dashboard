import { last } from "lodash";

import {
  Facility,
  ModelInputs,
  ReferenceFacility,
} from "../../page-multi-facility/types";

export const stateName = "Florida";
export const countyName = "Bay";

const userHistory = [
  {
    observedAt: new Date(2020, 5, 1),
    updatedAt: new Date(2020, 5, 10, 12, 0, 4),
    stateName,
    countyName,
    ageUnknownCases: 10,
    ageUnknownPopulation: 300,
  },
  {
    observedAt: new Date(2020, 5, 5),
    updatedAt: new Date(2020, 5, 5, 12, 0, 4),
    stateName,
    countyName,
    ageUnknownCases: 22,
    ageUnknownPopulation: 300,
  },
];

export const userFacility: Facility = {
  id: "testFacilityId",
  scenarioId: "testScenarioId",
  name: "Test Facility",
  createdAt: new Date(2020, 5, 5),
  updatedAt: new Date(),
  systemType: "State Prison",
  modelInputs: last(userHistory) as ModelInputs,
  modelVersions: userHistory,
};

export const referenceFacility: ReferenceFacility = {
  id: "testReferenceId",
  stateName,
  countyName,
  canonicalName: "Florida State Test Facility",
  facilityType: "State Prison",
  createdAt: new Date(2020, 5, 5),
  capacity: [{ date: new Date(2020, 0, 1), value: 275 }],
  population: [{ date: new Date(2020, 0, 1), value: 380 }],
  covidCases: [
    {
      observedAt: new Date(2020, 4, 28),
      popDeaths: 0,
      popTestedPositive: 5,
    },
    {
      observedAt: new Date(2020, 4, 29),
      popDeaths: 0,
      popTestedPositive: 6,
    },
    {
      observedAt: new Date(2020, 5, 1),
      popDeaths: 0,
      popTestedPositive: 9,
      popTested: 55,
    },
    {
      observedAt: new Date(2020, 5, 3),
      popDeaths: 0,
      popTestedPositive: 14,
      popTested: 55,
      staffTestedPositive: 1,
    },
    {
      observedAt: new Date(2020, 5, 4),
      popDeaths: 0,
      popTestedPositive: 19,
      popTested: 80,
      staffTestedPositive: 1,
    },
    {
      observedAt: new Date(2020, 5, 5),
      popDeaths: 1,
      popTestedPositive: 22,
      popTested: 80,
      staffTestedPositive: 1,
    },
    {
      observedAt: new Date(2020, 5, 7),
      popDeaths: 1,
      popTestedPositive: 28,
      popTested: 91,
      staffTestedPositive: 3,
    },
  ],
};

export const compositeFacility: Facility = {
  ...userFacility,
  canonicalName: referenceFacility.canonicalName,
  modelVersions: [
    {
      observedAt: new Date(2020, 4, 28),
      ageUnknownCases: 5,
      ageUnknownDeaths: 0,
      ageUnknownPopulation: referenceFacility.population[0].value,
      isReference: true,
      stateName,
      countyName,
      facilityCapacity: referenceFacility.capacity[0].value,
    },
    {
      observedAt: new Date(2020, 4, 29),
      ageUnknownCases: 6,
      ageUnknownDeaths: 0,
      ageUnknownPopulation: referenceFacility.population[0].value,
      isReference: true,
      stateName,
      countyName,
      facilityCapacity: referenceFacility.capacity[0].value,
    },
    userHistory[0],
    {
      observedAt: new Date(2020, 5, 3),
      ageUnknownCases: 14,
      ageUnknownDeaths: 0,
      ageUnknownPopulation: userHistory[0].ageUnknownPopulation,
      isReference: true,
      stateName,
      countyName,
      facilityCapacity: referenceFacility.capacity[0].value,
    },
    {
      observedAt: new Date(2020, 5, 4),
      ageUnknownCases: 19,
      ageUnknownDeaths: 0,
      ageUnknownPopulation: userHistory[0].ageUnknownPopulation,
      isReference: true,
      stateName,
      countyName,
      facilityCapacity: referenceFacility.capacity[0].value,
    },
    userHistory[1],
    {
      observedAt: new Date(2020, 5, 7),
      ageUnknownCases: 28,
      ageUnknownDeaths: 1,
      ageUnknownPopulation: userHistory[1].ageUnknownPopulation,
      isReference: true,
      stateName,
      countyName,
      facilityCapacity: referenceFacility.capacity[0].value,
    },
  ],
  modelInputs: {
    observedAt: new Date(2020, 5, 7),
    ageUnknownCases: 28,
    ageUnknownDeaths: 1,
    ageUnknownPopulation: userHistory[1].ageUnknownPopulation,
    isReference: true,
    stateName,
    countyName,
    facilityCapacity: referenceFacility.capacity[0].value,
  },
};
