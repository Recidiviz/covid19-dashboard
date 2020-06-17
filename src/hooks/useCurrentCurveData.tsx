import { useEffect, useState } from "react";

import { EpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import { getCurveInputs } from "../impact-dashboard/responseChartData";
import { CurveFunctionInputs } from "../infection-model";
import { LocaleData } from "../locale-data-context";

export function useCurrentCurveData(
  epidemicModelState: EpidemicModelState[],
  localeDataSource: LocaleData,
) {
  const [currentCurveInputs, setCurrentCurveInputs] = useState(
    [] as CurveFunctionInputs[],
  );

  useEffect(() => {
    if (epidemicModelState.length === 0) return;

    const currentCurveInputs = getCurveInputs(epidemicModelState);
    setCurrentCurveInputs(currentCurveInputs);
  }, [epidemicModelState, localeDataSource]);

  return currentCurveInputs;
}
