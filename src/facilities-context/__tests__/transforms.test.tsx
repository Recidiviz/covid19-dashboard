import { differenceInCalendarDays, isSameDay } from "date-fns";
import { last, pick } from "lodash";

import {
  Facility,
  ModelInputs,
  ReferenceFacility,
} from "../../page-multi-facility/types";
import { mergeFacilityObjects } from "../transforms";

describe("merged facility", () => {
  let userFacility: Facility;
  let userHistory: ModelInputs[];
  let referenceFacility: ReferenceFacility;
  const stateName = "Florida";

  beforeEach(() => {
    userHistory = [
      {
        observedAt: new Date(2020, 5, 1),
        updatedAt: new Date(2020, 5, 10, 12, 0, 4),
        stateCode: stateName,
        ageUnknownCases: 10,
        ageUnknownPopulation: 300,
      },
      {
        observedAt: new Date(2020, 5, 5),
        updatedAt: new Date(2020, 5, 5, 12, 0, 4),
        stateCode: stateName,
        ageUnknownCases: 22,
        ageUnknownPopulation: 300,
      },
    ];

    userFacility = {
      id: "testFacilityId",
      scenarioId: "testScenarioId",
      name: "Test Facility",
      createdAt: new Date(2020, 5, 5),
      updatedAt: new Date(),
      systemType: "State Prison",
      modelInputs: last(userHistory) as ModelInputs,
    };

    referenceFacility = {
      id: "testReferenceId",
      state: stateName,
      canonicalName: "Florida State Test Facility",
      facilityType: "State Prison",
      yearOpened: 1975,
      securityStatus: "mixed",
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
          observedAt: new Date(2020, 5, 2),
          popDeaths: 0,
          popTestedPositive: 9,
          popTested: 55,
          staffTestedPositive: 0,
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
  });

  it("can be created from user data alone", () => {
    const merged = mergeFacilityObjects({
      userData: { facility: userFacility, modelVersions: userHistory },
    });
    expect(merged).toEqual({
      facility: userFacility,
      modelVersions: userHistory,
    });
  });

  it("can be created from reference data plus minimal user data", () => {
    // a minimal facility (created from reference data) won't have any real model history,
    // but at least one model version will be created.
    // in this case we expect it to not actually have any case or population data
    userHistory = [pick(userFacility.modelInputs, ["observedAt", "updatedAt"])];

    const merged = mergeFacilityObjects({
      userData: { facility: userFacility, modelVersions: userHistory },
      referenceData: referenceFacility,
    });

    // extra metadata properties we expect to carry over
    const { canonicalName, yearOpened, securityStatus } = referenceFacility;

    expect(merged.facility).toEqual({
      ...userFacility,
      canonicalName,
      yearOpened,
      securityStatus,
    });

    const referencePop = referenceFacility.population[0].value;
    const referenceCapacity = referenceFacility.capacity[0].value;

    merged.modelVersions.forEach((mergedCase) => {
      const referenceCase = referenceFacility.covidCases.find(
        ({ observedAt }) => observedAt === mergedCase.observedAt,
      );
      expect(mergedCase).toEqual({
        observedAt: referenceCase?.observedAt,
        ageUnknownCases: referenceCase?.popTestedPositive,
        ageUnknownPopulation: referencePop,
        facilityCapacity: referenceCapacity,
        isReference: true,
        staffCases: referenceCase?.staffTestedPositive,
        staffPopulation: undefined,
      });
    });
  });

  it("can be created from reference data and robust user data", () => {
    const merged = mergeFacilityObjects({
      userData: { facility: userFacility, modelVersions: userHistory },
      referenceData: referenceFacility,
    });

    // extra metadata properties we expect to carry over
    const { canonicalName, yearOpened, securityStatus } = referenceFacility;

    expect(merged.facility).toEqual({
      ...userFacility,
      canonicalName,
      yearOpened,
      securityStatus,
    });

    const referencePop = referenceFacility.population[0].value;
    const referenceCapacity = referenceFacility.capacity[0].value;

    merged.modelVersions.forEach((mergedCase) => {
      const hasMatchingDate = ({ observedAt }: typeof mergedCase) =>
        isSameDay(observedAt, mergedCase.observedAt);
      const referenceCase = referenceFacility.covidCases.find(hasMatchingDate);
      const userCase = userHistory.find(hasMatchingDate);
      if (userCase) {
        expect(mergedCase).toEqual(userCase);
      } else if (referenceCase) {
        let expectedPopulation: number;
        if (
          differenceInCalendarDays(
            userHistory[0].observedAt,
            mergedCase.observedAt,
          ) > 0
        ) {
          expectedPopulation = referencePop;
        } else if (
          differenceInCalendarDays(
            userHistory[1].observedAt,
            mergedCase.observedAt,
          ) > 0
        ) {
          expectedPopulation = userHistory[0].ageUnknownPopulation as number;
        } else {
          expectedPopulation = userHistory[1].ageUnknownPopulation as number;
        }

        expect(mergedCase).toEqual({
          observedAt: referenceCase.observedAt,
          ageUnknownCases: referenceCase.popTestedPositive,
          ageUnknownPopulation: expectedPopulation,
          facilityCapacity: referenceCapacity,
          isReference: true,
          staffCases: referenceCase.staffTestedPositive,
        });
      } else {
        throw new Error("no case found matching this date");
      }
    });
  });

  it("sorts model versions chronologically", () => {
    userHistory.reverse();
    referenceFacility.covidCases.reverse();

    const merged = mergeFacilityObjects({
      userData: { facility: userFacility, modelVersions: userHistory },
      referenceData: referenceFacility,
    });
    let isChron = true;
    merged.modelVersions.reduce((prev, curr) => {
      isChron = isChron && prev.observedAt < curr.observedAt;
      return curr;
    });
    expect(isChron).toBe(true);
  });

  it("imputes missing reference staff population from user data", () => {
    const testStaffPop = 45;
    const testDay = new Date(2020, 5, 6);

    userHistory.push({
      observedAt: testDay,
      updatedAt: new Date(2020, 5, 6, 12, 0, 4),
      stateCode: stateName,
      ageUnknownCases: 25,
      ageUnknownPopulation: 300,
      staffCases: 1,
      staffPopulation: testStaffPop,
    });

    const merged = mergeFacilityObjects({
      userData: { facility: userFacility, modelVersions: userHistory },
      referenceData: referenceFacility,
    });

    merged.modelVersions.forEach((version) => {
      if (version.isReference) {
        expect(version.staffPopulation).toBe(testStaffPop);
      }
    });
  });

  it("imputes missing reference incarcerated population from user data", () => {
    referenceFacility.population = [];
    userHistory[1].ageUnknownPopulation = 290;

    const merged = mergeFacilityObjects({
      userData: { facility: userFacility, modelVersions: userHistory },
      referenceData: referenceFacility,
    });

    merged.modelVersions.forEach((version) => {
      if (version.isReference) {
        if (version.observedAt < userHistory[1].observedAt) {
          expect(version.ageUnknownPopulation).toBe(
            userHistory[0].ageUnknownPopulation,
          );
        } else {
          expect(version.ageUnknownPopulation).toBe(
            userHistory[1].ageUnknownPopulation,
          );
        }
      }
    });
  });
});
