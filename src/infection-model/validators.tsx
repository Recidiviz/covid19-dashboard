import {
  caseBracketKeys,
  ModelInputsPopulationBrackets,
} from "../impact-dashboard/EpidemicModelContext";

type ComparisonBounds = {
  previous?: ModelInputsPopulationBrackets;
  next?: ModelInputsPopulationBrackets;
};

export const validateCumulativeCases = (
  inputs: ModelInputsPopulationBrackets,
  { previous, next }: ComparisonBounds,
) => {
  let valid = true;

  if (previous !== undefined) {
    valid = (Object.keys(previous).filter((key) =>
      caseBracketKeys.includes(key as any),
    ) as Array<keyof ModelInputsPopulationBrackets>).reduce((valid, key) => {
      const inputVal = inputs[key];
      const prevVal = previous[key];
      // this is kind of nonsense in practice, but because
      // all these keys are optional, Typescript must be appeased
      if (prevVal === undefined) {
        return valid;
      }
      return valid && inputVal !== undefined && prevVal <= inputVal;
    }, valid as boolean);
  }

  if (next !== undefined) {
    valid = (Object.keys(next).filter((key) =>
      caseBracketKeys.includes(key as any),
    ) as Array<keyof ModelInputsPopulationBrackets>).reduce((valid, key) => {
      const inputVal = inputs[key];
      const nextVal = next[key];
      // this is kind of nonsense in practice, but because
      // all these keys are optional, Typescript must be appeased
      if (nextVal === undefined) {
        return valid;
      }
      return valid && inputVal !== undefined && nextVal >= inputVal;
    }, valid as boolean);
  }

  return valid;
};
