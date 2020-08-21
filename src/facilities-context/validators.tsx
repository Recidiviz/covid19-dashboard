import { differenceInCalendarDays } from "date-fns";
import { every, has, matchesProperty, maxBy, sample } from "lodash";

import { validateCumulativeCases } from "../infection-model/validators";
import { ModelInputs } from "../page-multi-facility/types";
import { FacilityMapping } from "./types";

type SingleDayValidator = (
  modelInputs: ModelInputs | null,
) => ModelInputs | null;

type HistoryValidator = (modelVersions: ModelInputs[]) => ModelInputs[];

function notNull(version: ModelInputs | null): version is ModelInputs {
  return version !== null;
}

const removeNonsenseCases: SingleDayValidator = (modelInputs) => {
  if (modelInputs?.isReference) {
    if (modelInputs.ageUnknownCases) {
      if (modelInputs.ageUnknownCases < 0) return null;
      if (
        modelInputs.ageUnknownPopulation !== undefined &&
        modelInputs.ageUnknownCases > modelInputs.ageUnknownPopulation
      )
        return null;
    }
  }
  return modelInputs;
};

const requirePopulation: SingleDayValidator = (modelInputs) => {
  const validInputs = modelInputs ? { ...modelInputs } : null;
  if (validInputs?.isReference) {
    // cases and fatalities without population should be removed
    if (validInputs.ageUnknownPopulation === undefined) {
      delete validInputs.ageUnknownCases;
      delete validInputs.ageUnknownDeaths;
      delete validInputs.ageUnknownPopulation;
    }
    if (validInputs.staffPopulation === undefined) {
      delete validInputs.staffCases;
      delete validInputs.staffPopulation;
    }
    // if there are now no cases at all, kill the record entirely
    if (
      !has(validInputs, "ageUnknownCases") &&
      !has(validInputs, "staffCases")
    ) {
      return null;
    }
  }
  return validInputs;
};

const getPrecedingVersion = (
  currentObservedAt: Date,
  modelInputVersions: ModelInputs[],
) => {
  return maxBy(
    modelInputVersions.filter(
      (version) =>
        differenceInCalendarDays(currentObservedAt, version.observedAt) >= 1,
    ),
    (version) => version.observedAt,
  );
};

const isMonotonicIncrease = (
  modelInputs: ModelInputs,
  modelInputVersions: ModelInputs[],
): boolean => {
  const currentObservedAt = modelInputs.observedAt;
  const previous = getPrecedingVersion(currentObservedAt, modelInputVersions);

  return validateCumulativeCases(modelInputs, {
    previous,
    compareSums: modelInputs.isReference || previous?.isReference,
  });
};

const ensureCasesIncreaseMonotonically: HistoryValidator = (modelVersions) => {
  const validModelVersions = [...modelVersions];
  for (const version of modelVersions) {
    if (!isMonotonicIncrease(version, validModelVersions)) {
      if (version.isReference) {
        validModelVersions.splice(validModelVersions.indexOf(version), 1);
      } else {
        // drop one or more preceding reference versions instead
        // until monotonicity is achieved (or we hit another user version)
        let monotonic = false;
        while (!monotonic) {
          const prev = getPrecedingVersion(
            version.observedAt,
            validModelVersions,
          );
          if (!prev || !prev.isReference) {
            break;
          }
          validModelVersions.splice(validModelVersions.indexOf(prev), 1);
          // repeat as necessary
          monotonic = isMonotonicIncrease(version, validModelVersions);
        }
      }
    }
  }
  return validModelVersions;
};

export function validateMergedModelVersions(
  modelVersions: ModelInputs[],
): ModelInputs[] {
  let validVersions = [...modelVersions];

  const singleDayValidators = [removeNonsenseCases, requirePopulation];
  const historyValidators = [ensureCasesIncreaseMonotonically];

  for (const fn of singleDayValidators) {
    validVersions = validVersions.map(fn).filter(notNull);
  }

  for (const fn of historyValidators) {
    validVersions = fn(validVersions);
  }

  return validVersions;
}

export function isSingleSystem(facilities: FacilityMapping) {
  const randomFacility = sample(facilities);

  return every(
    facilities,
    (facility) =>
      matchesProperty(
        "modelInputs.stateName",
        randomFacility?.modelInputs.stateName,
      )(facility) &&
      matchesProperty("systemType", randomFacility?.systemType)(facility),
  );
}
