import { scaleThreshold } from "d3";
import { getTime, isSameDay } from "date-fns";
import { last, omit, orderBy } from "lodash";
import { Optional } from "utility-types";

import {
  hasCapacity,
  hasCases,
  hasPopulation,
  hasStaffPopulation,
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
  userFacility: Facility;
  referenceFacility?: ReferenceFacility;
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
      ...userVersions.filter(hasCapacity).map((version) => ({
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
    userVersions.filter(hasStaffPopulation).map((version) => ({
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
}: Optional<MergedHistoryInputs, "referenceFacility">): ModelInputs[] {
  const combinedVersions: ModelInputs[] = [...userVersions];
  let { stateName, countyName } = combinedVersions.length
    ? (last(combinedVersions) as ModelInputs)
    : ({} as ModelInputs);

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

    stateName = stateName || referenceFacility.stateName;
    countyName = countyName || referenceFacility.countyName;

    // fill any gaps with reference records:
    // don't overwrite any user records with actual data
    referenceFacility.covidCases.forEach(
      ({ observedAt, popDeaths, popTestedPositive, staffTestedPositive }) => {
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
          // if there is already case data for this date, bail out now;
          // we won't use any reference data for this date
          if (hasCases(existingRecord)) return;

          // if we've gotten this far, we will be inserting reference data;
          // this flag tells us to splice it in rather than append it
          shouldReplaceExisting = true;
        }

        const newRecord = {
          isReference: true,
          observedAt,
          ageUnknownDeaths: popDeaths,
          ageUnknownCases: popTestedPositive,
          ageUnknownPopulation: populationForDate(observedAt),
          facilityCapacity: capacityForDate(observedAt),
          staffCases: staffTestedPositive,
          staffPopulation: staffPopByDate(observedAt),
          stateName,
          countyName,
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

export function mergeFacilityObjects({
  userFacility,
  referenceFacility,
}: MergeProps): Facility {
  const mergedFacility = { ...userFacility };

  if (referenceFacility) {
    // pull in additional facility metadata fields
    const additionalMetadata = omit(referenceFacility, [
      "id",
      "stateName",
      "countyName",
      "facilityType",
      "capacity",
      "population",
      "covidCases",
    ]);
    Object.assign(mergedFacility, additionalMetadata);

    mergedFacility.modelVersions = mergeModelVersions({
      userVersions: userFacility.modelVersions,
      referenceFacility: referenceFacility,
    });

    const mostRecentVersion = last(mergedFacility.modelVersions);
    if (mostRecentVersion) {
      mergedFacility.modelInputs = mostRecentVersion;
    }
  }

  return mergedFacility;
}
