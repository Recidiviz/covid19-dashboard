import { useEffect, useState } from "react";

import { EpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import { getEpidemicModelState } from "../infection-model";
import { LocaleData } from "../locale-data-context";
import { Facilities } from "../page-multi-facility/types";

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
