/**
 * This file includes test cases that can be run manually to exercise the
 * custom functions that we've written to read and write data to Firestore.
 * At a later date, we should consider moving its contents into a proper
 * testing framework.
 * (If/when ported to Jest, remove this directory from testPathIgnorePatterns
 * in Jest config.)
 */
import { deleteFacility, saveFacility } from "../index";

// 1. Full Form Submission - New Facility
//
// Note: some fields get submitted along with the form submission
// that aren't actually valid model inputs (i.e. localeDataSource)
saveFacility({
  name: "Ascension Correctional Facility",
  modelInputs: {
    stateCode: "Louisiana",
    countyName: "Ascension",
    rateOfSpreadFactor: "moderate",
    usePopulationSubsets: true,
    facilityOccupancyPct: 0.85,
    facilityDormitoryPct: 0.25,
    hospitalBeds: 24,
    localeDataSource: {},
    totalIncarcerated: 480,
    ageUnknownPopulation: 305,
    ageUnknownCases: 3,
    confirmedCases: 451,
    staffCases: 3,
    staffPopulation: 37,
    plannedReleases: [
      {
        date: "2020-04-24T04:00:00.000Z",
        count: 100,
      },
      {
        date: "2020-05-01T04:00:00.000Z",
        count: 50,
      },
    ],
    age0Cases: 2,
    age20Cases: 1,
    age45Cases: 3,
    age55Cases: 1,
    age65Cases: 1,
    age75Cases: 1,
    age85Cases: 1,
    age85Population: 25,
    age75Population: 25,
    age65Population: 25,
    age55Population: 25,
    age45Population: 25,
    age20Population: 25,
    age0Population: 25,
  },
});

// Verified to work as expected;
// localeDataSource was not persisted as desired  ✅

// 2. Full Form Submission - Updated Facility
//
// Notes:
//  - For string fields I'm adding a little extra text
//  - For booleans I'm just toggling them
//  - For number I'm incrementing them by 1 or .1
//  - For dates I'm adding a day
saveFacility({
  id: "ID FROM EXISTING FACILITY",
  name: "Ascension Correctional Facility - u",
  modelInputs: {
    stateCode: "Virginia",
    countyName: "Arlington",
    rateOfSpreadFactor: "high",
    usePopulationSubsets: false,
    facilityOccupancyPct: 0.86,
    facilityDormitoryPct: 0.26,
    hospitalBeds: 25,
    localeDataSource: {},
    totalIncarcerated: 481,
    ageUnknownPopulation: 306,
    ageUnknownCases: 4,
    confirmedCases: 452,
    staffCases: 4,
    staffPopulation: 38,
    plannedReleases: [
      {
        date: "2020-04-25T04:00:00.000Z",
        count: 101,
      },
      {
        date: "2020-05-02T04:00:00.000Z",
        count: 51,
      },
    ],
    age0Cases: 3,
    age20Cases: 2,
    age45Cases: 4,
    age55Cases: 2,
    age65Cases: 2,
    age75Cases: 2,
    age85Cases: 2,
    age85Population: 26,
    age75Population: 26,
    age65Population: 26,
    age55Population: 26,
    age45Population: 26,
    age20Population: 26,
    age0Population: 26,
  },
});

// Verified to work as expected ✅

// 3. Shallow Name Change

saveFacility({
  id: "ID FROM EXISTING FACILITY",
  name: "Arlington Correctional Facility",
});

// Verified to work as expected ✅

// 4. Shallow model input change

saveFacility({
  id: "ID FROM EXISTING FACILITY",
  modelInputs: {
    age0Population: 26,
  },
});

// Verified to work as expected, but don't do this
// because it erases all other modelInput data ❌

// 5.  Update only the age0Population

saveFacility({
  id: "HKdRt67o21iU11KqNbXt",
  modelInputs: {
    stateCode: "Virginia",
    countyName: "Arlington",
    rateOfSpreadFactor: "high",
    usePopulationSubsets: false,
    facilityOccupancyPct: 0.86,
    facilityDormitoryPct: 0.26,
    hospitalBeds: 25,
    localeDataSource: {},
    totalIncarcerated: 481,
    ageUnknownPopulation: 306,
    ageUnknownCases: 4,
    confirmedCases: 452,
    staffCases: 4,
    staffPopulation: 38,
    plannedReleases: [
      {
        date: "2020-04-25T04:00:00.000Z",
        count: 101,
      },
      {
        date: "2020-05-02T04:00:00.000Z",
        count: 51,
      },
    ],
    age0Cases: 3,
    age20Cases: 2,
    age45Cases: 4,
    age55Cases: 2,
    age65Cases: 2,
    age75Cases: 2,
    age85Cases: 2,
    age85Population: 26,
    age75Population: 26,
    age65Population: 26,
    age55Population: 26,
    age45Population: 26,
    age20Population: 26,
    age0Population: 1234,
  },
});

// Verified to work as expected ✅
// Note this techincally updates all of the fields

// 6.  Delete a facility

deleteFacility("EXISTING FACILITY ID");

// Works as expected ✅

// 7.  Attempt to update an non-existent facility

saveFacility({
  id: "NON-EXISTENT ID",
  name: "Broken",
});

// Errors out as expected ✅

// 8.  Attempt to delete a non-existent facility

deleteFacility("NON-EXISTENT ID");

// Firestore treats this as a no-op ✅
