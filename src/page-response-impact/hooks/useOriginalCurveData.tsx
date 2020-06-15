import { useEffect, useState } from "react";

import { EpidemicModelState } from "../../impact-dashboard/EpidemicModelContext";
import { CurveFunctionInputs } from "../../infection-model";
import { LocaleData } from "../../locale-data-context";
import {
  getCurveInputs,
  getEpidemicModelState,
  originalProjection,
  SystemWideData,
} from "../responseChartData";

export function useOriginalCurveData(
  epidemicModelState: EpidemicModelState[],
  systemWideData: SystemWideData,
  localeDataSource: LocaleData,
) {
  const [originalCurveInputs, setOriginalCurveInputs] = useState(
    [] as CurveFunctionInputs[],
  );

  useEffect(() => {
    if (epidemicModelState.length === 0) return;
    const originalInputs = getEpidemicModelState(
      originalProjection(systemWideData),
      localeDataSource,
    );

    const originalCurveInputs = getCurveInputs(originalInputs);

    setOriginalCurveInputs(originalCurveInputs);
  }, [epidemicModelState, systemWideData, localeDataSource]);

  return originalCurveInputs;
}
