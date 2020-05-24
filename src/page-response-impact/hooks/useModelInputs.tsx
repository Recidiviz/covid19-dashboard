import { useEffect, useState } from "react";

import { EpidemicModelState } from "../../components/impact-dashboard/EpidemicModelContext";
import { LocaleData } from "../../contexts/locale-data-context";
import { getModelInputs } from "../responseChartData";
import { FacilitiesState } from "./useFacilities";

export function useModelInputs(
  facilities: FacilitiesState,
  localeDataSource: LocaleData,
) {
  const [modelInputs, setModelInputs] = useState([] as EpidemicModelState[]);

  useEffect(() => {
    if (facilities.data.length) {
      const modelInputs = getModelInputs(facilities.data, localeDataSource);
      setModelInputs(modelInputs);
    }
  }, [facilities, localeDataSource]);

  return modelInputs;
}
