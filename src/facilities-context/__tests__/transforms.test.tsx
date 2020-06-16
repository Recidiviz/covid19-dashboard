import { differenceInCalendarDays, isSameDay } from "date-fns";
import { last, omit, pick } from "lodash";

import {
  Facility,
  ModelInputs,
  ReferenceFacility,
} from "../../page-multi-facility/types";
import { mergeFacilityObjects } from "../transforms";

function getFindByDay(targetDate: Date) {
  return ({ observedAt }: { observedAt: Date }) =>
    isSameDay(observedAt, targetDate);
}

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

    const userFacilityMetadata = omit(userFacility, ["modelInputs"]);

    expect(merged.facility).toEqual({
      ...userFacilityMetadata,
      canonicalName,
      yearOpened,
      securityStatus,
      modelInputs: last(merged.modelVersions),
    });

    const referencePop = referenceFacility.population[0].value;
    const referenceCapacity = referenceFacility.capacity[0].value;

    expect(merged.modelVersions.length).toBe(
      referenceFacility.covidCases.length,
    );

    merged.modelVersions.forEach((mergedCase) => {
      const referenceCase = referenceFacility.covidCases.find(
        getFindByDay(mergedCase.observedAt),
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

    const userFacilityMetadata = omit(userFacility, ["modelInputs"]);

    expect(merged.facility).toEqual({
      ...userFacilityMetadata,
      canonicalName,
      yearOpened,
      securityStatus,
      modelInputs: last(merged.modelVersions),
    });

    const referencePop = referenceFacility.population[0].value;
    const referenceCapacity = referenceFacility.capacity[0].value;

    expect(merged.modelVersions.length).toBe(7);

    merged.modelVersions.forEach((mergedCase) => {
      const hasMatchingDate = getFindByDay(mergedCase.observedAt);
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

  it("should sort model versions chronologically", () => {
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

  it("should impute missing reference staff population from user data", () => {
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

  it("should impute missing reference incarcerated population from user data", () => {
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

  it("should impute missing reference capacity from user data", () => {
    referenceFacility.capacity = [];
    userHistory[0].facilityCapacity = 345;
    userHistory[1].facilityCapacity = 275;

    const merged = mergeFacilityObjects({
      userData: { facility: userFacility, modelVersions: userHistory },
      referenceData: referenceFacility,
    });

    merged.modelVersions.forEach((version) => {
      if (version.isReference) {
        if (version.observedAt < userHistory[1].observedAt) {
          expect(version.facilityCapacity).toBe(
            userHistory[0].facilityCapacity,
          );
        } else {
          expect(version.facilityCapacity).toBe(
            userHistory[1].facilityCapacity,
          );
        }
      }
    });
  });

  it("should use reference data as facility.modelInputs when it is most recent", () => {
    const merged = mergeFacilityObjects({
      userData: { facility: userFacility, modelVersions: userHistory },
      referenceData: referenceFacility,
    });

    expect(merged.facility.modelInputs).toBe(last(merged.modelVersions));
    expect(merged.facility.modelInputs.isReference).toBe(true);
  });

  describe("validation", () => {
    it("should reject reference days with nonsensical case values", () => {
      const testRecord = referenceFacility.covidCases[0];
      testRecord.popTestedPositive = -5;

      let merged = mergeFacilityObjects({
        userData: { facility: userFacility, modelVersions: userHistory },
        referenceData: referenceFacility,
      });

      expect(
        merged.modelVersions.find(getFindByDay(testRecord.observedAt)),
      ).toBeUndefined();

      testRecord.popTestedPositive = referenceFacility.population[0].value + 20;

      merged = mergeFacilityObjects({
        userData: { facility: userFacility, modelVersions: userHistory },
        referenceData: referenceFacility,
      });

      expect(
        merged.modelVersions.find(getFindByDay(testRecord.observedAt)),
      ).toBeUndefined();
    });

    it("should reject reference case counts that do not increase monotonically", () => {
      // this should be before the earliest piece of user data
      const testDay = referenceFacility.covidCases[1];
      testDay.popTestedPositive = 2;

      const merged = mergeFacilityObjects({
        userData: { facility: userFacility, modelVersions: userHistory },
        referenceData: referenceFacility,
      });

      expect(
        merged.modelVersions.find(getFindByDay(testDay.observedAt)),
      ).toBeUndefined();
    });

    it("should reject reference case counts that do not increase monotonically compared to user data", () => {
      // this is the day after the first piece of user data, which has a higher count than this does
      const testDay = {
        observedAt: new Date(2020, 5, 2),
        popDeaths: 0,
        popTestedPositive: 9,
        popTested: 55,
        staffTestedPositive: 0,
      };
      referenceFacility.covidCases.push(testDay);

      const merged = mergeFacilityObjects({
        userData: { facility: userFacility, modelVersions: userHistory },
        referenceData: referenceFacility,
      });

      expect(
        merged.modelVersions.find(getFindByDay(testDay.observedAt)),
      ).toBeUndefined();
    });

    it("should not reject user case counts that do not increase monotonically", () => {
      const testDay = userHistory[1];
      const unaffectedReferenceDay = referenceFacility.covidCases[1];
      const unaffectedUserDay = userHistory[0];
      const affectedReferenceDays = referenceFacility.covidCases.slice(3, 5);

      testDay.ageUnknownCases = 5;

      const merged = mergeFacilityObjects({
        userData: { facility: userFacility, modelVersions: userHistory },
        referenceData: referenceFacility,
      });

      expect(
        merged.modelVersions.find(getFindByDay(testDay.observedAt)),
      ).toEqual(testDay);

      // even though these two user records violate monotonicity,
      // they should be allowed to stand
      expect(
        merged.modelVersions.find(getFindByDay(unaffectedUserDay.observedAt)),
      ).toEqual(unaffectedUserDay);

      // but all of the reference days between the two user days should be gone
      for (const affectedReferenceDay of affectedReferenceDays) {
        expect(
          merged.modelVersions.find(
            getFindByDay(affectedReferenceDay.observedAt),
          ),
        ).toBeUndefined();
      }

      // the reference day that precedes the earlier user day should still be there,
      // even though its case count is larger than the test day's
      expect(
        merged.modelVersions.find(
          getFindByDay(unaffectedReferenceDay.observedAt),
        ),
      ).toBeDefined();
    });
  });
});
