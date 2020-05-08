import { useEffect, useState } from "react";

import { EpidemicModelState } from "../../impact-dashboard/EpidemicModelContext";
import { CurveFunctionInputs } from "../../infection-model";
import { LocaleData } from "../../locale-data-context";
import { getCurveInputs } from "../responseChartData";

export function useCurrentCurveData(
  modelInputs: EpidemicModelState[],
  localeDataSource: LocaleData,
) {
  const [currentCurveInputs, setCurrentCurveInputs] = useState(
    [] as CurveFunctionInputs[],
  );

  useEffect(() => {
    if (modelInputs.length === 0) return;

    const currentCurveInputs = getCurveInputs(modelInputs);
    setCurrentCurveInputs(currentCurveInputs);
  }, [modelInputs, localeDataSource]);

  return currentCurveInputs;
}
