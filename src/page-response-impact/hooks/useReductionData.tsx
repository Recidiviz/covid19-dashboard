import { useEffect, useState } from "react";

import { CurveFunctionInputs } from "../../infection-model";
import { calculateCurveData } from "../responseChartData";
import {
  buildReductionData,
  buildResponseImpactCardData,
  reductionCardDataType,
} from "../utils/ResponseImpactCardStateUtils";

export function useReductionData(
  originalCurveInputs: CurveFunctionInputs[],
  currentCurveInputs: CurveFunctionInputs[],
) {
  const [reductionCardData, setreductionCardData] = useState<
    reductionCardDataType | undefined
  >();

  useEffect(() => {
    const originalCurveDataPerFacility = calculateCurveData(
      originalCurveInputs,
    );
    const origData = buildResponseImpactCardData(originalCurveDataPerFacility);
    const currentCurveDataPerFacility = calculateCurveData(currentCurveInputs);
    const currData = buildResponseImpactCardData(currentCurveDataPerFacility);

    // positive value is a reduction
    const reduction = buildReductionData(origData, currData);

    setreductionCardData(reduction);
  }, [originalCurveInputs, currentCurveInputs]);

  return reductionCardData;
}
