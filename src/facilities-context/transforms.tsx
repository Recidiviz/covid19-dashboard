import { scaleThreshold } from "d3";
import { getTime, isSameDay } from "date-fns";
import { omit, orderBy } from "lodash";
import { Optional } from "utility-types";

import {
  hasCases,
  hasPopulation,
  totalIncarceratedPopulation,
} from "../impact-dashboard/EpidemicModelContext";
import {
  Facility,
  ModelInputs,
  ReferenceFacility,
  SimpleTimeseries,
} from "../page-multi-facility/types";
import { validateMergedModelVersions } from "./validators";

type MergeProps = {
  userData: {
    facility: Facility;
    modelVersions: ModelInputs[];
  };
  referenceData?: ReferenceFacility;
};

type MergedFacility = Facility & {
  canonicalName?: string;
  [key: string]: unknown;
};

export type MergedModelInputs = Optional<ModelInputs, "updatedAt"> & {
  isReference?: boolean;
};

type MergedHistoryInputs = {
  userVersions: ModelInputs[];
  referenceFacility: ReferenceFacility;
};

function getDateThresholdFunc(records: SimpleTimeseries[]) {
  // the D3 scale function needs these as numbers so we'll use timestamps
  const dateThresholds = records.map(({ date }) => getTime(date));
  const outputValues = records.map(({ value }) => value);
  // the range must have one extra value to capture numbers below the first threshold;
  // in this case the oldest value we have should be used for any dates that precede it
  outputValues.unshift(outputValues[0]);

  const thresholdFunc = scaleThreshold()
    .domain(dateThresholds)
    .range(outputValues);

  return (d: Date) => thresholdFunc(getTime(d));
}

function getPopulationFunc({
  userVersions,
  referenceFacility,
}: MergedHistoryInputs) {
  // get timeline of population values
  // (because they change less frequently and are not part of reference covid records)
  const populationByDate: SimpleTimeseries[] = orderBy(
    [
      ...referenceFacility.population,
      ...userVersions.filter(hasPopulation).map((version) => ({
        date: version.observedAt,
        value: totalIncarceratedPopulation(version),
      })),
    ],
    ["date"],
  );

  return getDateThresholdFunc(populationByDate);
}

function getCapacityFunc({
  userVersions,
  referenceFacility,
}: MergedHistoryInputs) {
  // get timeline of capacity values
  // (because they change less frequently and are not part of reference covid records)
  const capacityByDate: SimpleTimeseries[] = orderBy(
    [
      ...referenceFacility.capacity,
      ...userVersions
        .filter((version) => version.facilityCapacity !== undefined)
        .map((version) => ({
          date: version.observedAt,
          // this is a safe assertion because we filtered out undefined values above,
          // although TypeScript is not smart enough to figure that out
          value: version.facilityCapacity as number,
        })),
    ],
    ["date"],
  );

  return getDateThresholdFunc(capacityByDate);
}

function getStaffPopulationFunc({
  userVersions,
}: // NOTE: currently we don't have any staff counts in reference data
Pick<MergedHistoryInputs, "userVersions">) {
  const staffPopByDate: SimpleTimeseries[] = orderBy(
    userVersions
      .filter((version) => version.staffPopulation !== undefined)
      .map((version) => ({
        date: version.observedAt,
        // this is a safe assertion because we filtered out undefined values above,
        // although TypeScript is not smart enough to figure that out
        value: version.staffPopulation as number,
      })),
    ["date"],
  );

  return getDateThresholdFunc(staffPopByDate);
}

function mergeModelVersions({
  userVersions,
  referenceFacility,
}: Optional<MergedHistoryInputs, "referenceFacility">): MergedModelInputs[] {
  const combinedVersions: MergedModelInputs[] = [...userVersions];

  if (referenceFacility) {
    const populationForDate = getPopulationFunc({
      userVersions,
      referenceFacility,
    });

    const capacityForDate = getCapacityFunc({
      userVersions,
      referenceFacility,
    });

    const staffPopByDate = getStaffPopulationFunc({ userVersions });

    // fill any gaps with reference records:
    // don't overwrite any user records with actual data
    referenceFacility.covidCases.forEach(
      ({ observedAt, popTestedPositive, staffTestedPositive }) => {
        const existingRecord = combinedVersions.find((v) =>
          isSameDay(v.observedAt, observedAt),
        );

        // although generally speaking reference data should NEVER replace
        // existing user data, due to some quirks in our data modeling
        // it is possible to save model versions that don't actually contain
        // any case data; if that's the case we will actually want to use
        // some reference data for that day
        let shouldReplaceExisting = false;

        if (existingRecord) {
          if (hasCases(existingRecord)) return;

          shouldReplaceExisting = true;
        }

        const newRecord = {
          isReference: true,
          observedAt,
          ageUnknownCases: popTestedPositive,
          ageUnknownPopulation: populationForDate(observedAt),
          facilityCapacity: capacityForDate(observedAt),
          staffCases: staffTestedPositive,
          staffPopulation: staffPopByDate(observedAt),
        };
        if (shouldReplaceExisting && existingRecord) {
          const i = combinedVersions.indexOf(existingRecord);
          combinedVersions[i] = newRecord;
        } else {
          combinedVersions.push(newRecord);
        }
      },
    );
  }

  return orderBy(
    validateMergedModelVersions(combinedVersions),
    ["observedAt"],
    ["asc"],
  );
}

export const mergeFacilityObjects = ({
  userData: { facility, modelVersions },
  referenceData,
}: MergeProps): {
  facility: MergedFacility;
  modelVersions: MergedModelInputs[];
} => {
  const mergedFacility = { ...facility };
  const mergedModelVersions = mergeModelVersions({
    userVersions: modelVersions,
    referenceFacility: referenceData,
  });

  if (referenceData) {
    // pull in additional facility metadata fields
    const additionalMetadata = omit(referenceData, [
      "id",
      "state",
      "facilityType",
      "capacity",
      "population",
      "covidCases",
    ]);
    Object.assign(mergedFacility, additionalMetadata);
  }

  return { facility: mergedFacility, modelVersions: mergedModelVersions };
};
