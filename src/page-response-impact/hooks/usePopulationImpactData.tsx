import { useEffect, useState } from "react";

import { CurveFunctionInputs } from "../../infection-model";
import { calculateCurveData } from "../responseChartData";
import {
  calculatePopulationImpactDifference,
  PopulationImpact,
  sumPopulationImpactAcrossFacilities,
} from "../utils/ResponseImpactCardStateUtils";

export function usePopulationImpactData(
  originalCurveInputs: CurveFunctionInputs[],
  currentCurveInputs: CurveFunctionInputs[],
) {
  const [populationImpact, setPopulationImpact] = useState<
    PopulationImpact | undefined
  >();

  useEffect(() => {
    const originalCurveDataPerFacility = calculateCurveData(
      originalCurveInputs,
    );
    const origData = sumPopulationImpactAcrossFacilities(
      originalCurveDataPerFacility,
    );
    const currentCurveDataPerFacility = calculateCurveData(currentCurveInputs);
    const currData = sumPopulationImpactAcrossFacilities(
      currentCurveDataPerFacility,
    );
    const populationImpact = calculatePopulationImpactDifference(
      origData,
      currData,
    );

    setPopulationImpact(populationImpact);
  }, [originalCurveInputs, currentCurveInputs]);

  return populationImpact;
}
