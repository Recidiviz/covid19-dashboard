import { differenceInCalendarDays } from "date-fns";
import { maxBy } from "lodash";

import { validateCumulativeCases } from "../infection-model/validators";
import { MergedModelInputs } from "./transforms";

type SingleDayValidator = (
  modelInputs: MergedModelInputs | null,
) => MergedModelInputs | null;

type HistoryValidator = (
  modelVersions: MergedModelInputs[],
) => MergedModelInputs[];

function notNull(
  version: MergedModelInputs | null,
): version is MergedModelInputs {
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

const getPrecedingVersion = (
  currentObservedAt: Date,
  modelInputVersions: MergedModelInputs[],
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
  modelInputs: MergedModelInputs,
  modelInputVersions: MergedModelInputs[],
): boolean => {
  const currentObservedAt = modelInputs.observedAt;
  const previous = getPrecedingVersion(currentObservedAt, modelInputVersions);

  return validateCumulativeCases(modelInputs, { previous });
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
  modelVersions: MergedModelInputs[],
): MergedModelInputs[] {
  let validVersions = [...modelVersions];

  const singleDayValidators = [removeNonsenseCases];
  const historyValidators = [ensureCasesIncreaseMonotonically];

  for (const fn of singleDayValidators) {
    validVersions = validVersions.map(fn).filter(notNull);
  }

  for (const fn of historyValidators) {
    validVersions = fn(validVersions);
  }

  return validVersions;
}
