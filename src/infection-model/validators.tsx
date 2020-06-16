import {
  caseBracketKeys,
  ModelInputsPopulationBrackets,
  totalConfirmedCases,
} from "../impact-dashboard/EpidemicModelContext";

type ComparisonOptions = {
  previous?: ModelInputsPopulationBrackets;
  next?: ModelInputsPopulationBrackets;
  compareSums?: boolean;
};

type ComparisonFunction = (
  currentVal: number,
  comparisonVal: number,
) => boolean;

const validateCasesByKey = (
  current: ModelInputsPopulationBrackets,
  comparedTo: ModelInputsPopulationBrackets,
  compareFn: ComparisonFunction,
): boolean => {
  return (Object.keys(comparedTo).filter((key) =>
    caseBracketKeys.includes(key as any),
  ) as Array<keyof ModelInputsPopulationBrackets>).reduce((valid, key) => {
    const currentVal = current[key];
    const comparisonVal = comparedTo[key];
    // this is kind of nonsense in practice, but because
    // all these keys are optional, Typescript must be appeased
    if (comparisonVal === undefined) {
      return valid;
    }
    return (
      valid && currentVal !== undefined && compareFn(currentVal, comparisonVal)
    );
  }, true as boolean);
};

const validateCasesBySum = (
  current: ModelInputsPopulationBrackets,
  comparedTo: ModelInputsPopulationBrackets,
  compareFn: ComparisonFunction,
): boolean => {
  return compareFn(
    totalConfirmedCases(current),
    totalConfirmedCases(comparedTo),
  );
};

export const validateCumulativeCases = (
  inputs: ModelInputsPopulationBrackets,
  { previous, next, compareSums }: ComparisonOptions,
) => {
  let valid = true;

  if (previous !== undefined) {
    const compareFn = (current: number, comparison: number) =>
      comparison <= current;
    if (compareSums) {
      valid = valid && validateCasesBySum(inputs, previous, compareFn);
    } else {
      valid = valid && validateCasesByKey(inputs, previous, compareFn);
    }
  }

  if (next !== undefined) {
    const compareFn = (current: number, comparison: number) =>
      comparison >= current;
    if (compareSums) {
      valid = valid && validateCasesBySum(inputs, next, compareFn);
    } else {
      valid = valid && validateCasesByKey(inputs, next, compareFn);
    }
  }

  return valid;
};
