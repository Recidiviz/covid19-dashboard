import { useEffect, useState } from "react";

import { EpidemicModelState } from "../../impact-dashboard/EpidemicModelContext";
import { LocaleData } from "../../locale-data-context";
import { Facilities } from "../../page-multi-facility/types";
import { getEpidemicModelState } from "../responseChartData";

export function useEpidemicModelState(
  facilities: Facilities,
  localeDataSource: LocaleData,
) {
  const [epidemicModelState, setEpidemicModelState] = useState(
    [] as EpidemicModelState[],
  );
  useEffect(() => {
    if (facilities.length) {
      const epidemicModelState = getEpidemicModelState(
        facilities,
        localeDataSource,
      );
      setEpidemicModelState(epidemicModelState);
    }
  }, [facilities, localeDataSource]);

  return epidemicModelState;
}
