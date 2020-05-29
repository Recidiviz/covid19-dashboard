import { useCallback } from "react";

import {
  ModelInputsPopulationBrackets,
  totalConfirmedCases,
} from "../impact-dashboard/EpidemicModelContext";

type Props = {
  previous?: ModelInputsPopulationBrackets;
  next?: ModelInputsPopulationBrackets;
};

const useCumulativeCaseValidation = ({ previous, next }: Props) => {
  const previousCases = previous ? totalConfirmedCases(previous) : undefined;
  const nextCases = next ? totalConfirmedCases(next) : undefined;

  const validateCases = useCallback(
    (inputs: ModelInputsPopulationBrackets) => {
      let valid = true;

      const inputCases = totalConfirmedCases(inputs);

      if (previousCases !== undefined) {
        valid = valid && previousCases <= inputCases;
      }

      if (nextCases !== undefined) {
        valid = valid && inputCases <= nextCases;
      }

      return valid;
    },
    [nextCases, previousCases],
  );
  return { validateCases };
};

export default useCumulativeCaseValidation;
