import { useEffect, useState } from "react";

import { EpidemicModelState } from "../../impact-dashboard/EpidemicModelContext";
import { CurveFunctionInputs } from "../../infection-model";
import { LocaleData } from "../../locale-data-context";
import {
  getCurveInputs,
  getModelInputs,
  originalProjection,
  SystemWideData,
} from "../responseChartData";

export function useOriginalCurveData(
  modelInputs: EpidemicModelState[],
  systemWideData: SystemWideData,
  localeDataSource: LocaleData,
) {
  const [originalCurveInputs, setOriginalCurveInputs] = useState(
    [] as CurveFunctionInputs[],
  );

  useEffect(() => {
    if (modelInputs.length === 0) return;

    const originalInputs = getModelInputs(
      originalProjection(systemWideData),
      localeDataSource,
    );

    const originalCurveInputs = getCurveInputs(originalInputs);

    setOriginalCurveInputs(originalCurveInputs);
  }, [modelInputs, systemWideData, localeDataSource]);

  return originalCurveInputs;
}
