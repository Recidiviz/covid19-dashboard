import {
  ModelInputsPopulationBrackets,
  totalConfirmedCases,
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
  const previousCases = previous ? totalConfirmedCases(previous) : undefined;
  const nextCases = next ? totalConfirmedCases(next) : undefined;

  const inputCases = totalConfirmedCases(inputs);

  if (previousCases !== undefined) {
    valid = valid && previousCases <= inputCases;
  }

  if (nextCases !== undefined) {
    valid = valid && inputCases <= nextCases;
  }

  return valid;
};
