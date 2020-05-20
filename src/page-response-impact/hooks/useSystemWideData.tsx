import { reverse } from "lodash";
import { useEffect, useState } from "react";

import {
  EpidemicModelState,
  getLocaleDefaults,
} from "../../impact-dashboard/EpidemicModelContext";
import { LocaleData } from "../../locale-data-context";
import { Scenario } from "../../page-multi-facility/types";
import { getSystemWideSums, SystemWideData } from "../responseChartData";
import { FacilitiesState } from "./useFacilities";

export function useSystemWideData(
  baselinePopulations: Scenario["baselinePopulations"],
  facilities: FacilitiesState,
  modelInputs: EpidemicModelState[],
  localeDataSource: LocaleData,
) {
  const [systemWideData, setSystemWideData] = useState<SystemWideData>({
    staffPopulation: 0,
    incarceratedPopulation: 0,
  } as SystemWideData);

  useEffect(() => {
    if (modelInputs.length === 0 || facilities.data.length === 0) return;

    // Reverse the populations array to get the most recently modelled populations
    const populationsCopy = baselinePopulations
      ? reverse([...baselinePopulations])
      : [];

    let userInputStaffPopulation,
      userInputIncarceratedPopulation,
      localeDefaultIncarceratedPopulation;

    if (populationsCopy.length > 0) {
      userInputDate = populationsCopy[0].date
      userInputStaffPopulation = populationsCopy[0].staffPopulation;
      userInputIncarceratedPopulation =
        populationsCopy[0].incarceratedPopulation;
    }

    const systemType = facilities.data[0].systemType;

    if (systemType === "State Prison") {
      localeDefaultIncarceratedPopulation = getLocaleDefaults(
        localeDataSource,
        modelInputs[0].stateCode,
      ).totalPrisonPopulation;
    } else {
      localeDefaultIncarceratedPopulation = getLocaleDefaults(
        localeDataSource,
        modelInputs[0].stateCode,
        modelInputs[0].countyName,
      ).totalJailPopulation;
    }

    const { staffPopulation: currentStaffPopulation } = getSystemWideSums(
      modelInputs,
    );

    setSystemWideData({
      ...getSystemWideSums(modelInputs),
      baselinePopulationDate: userInputDate || new Date(2020, 1, 1);
      staffPopulation: userInputStaffPopulation || currentStaffPopulation,
      incarceratedPopulation:
        userInputIncarceratedPopulation ||
        localeDefaultIncarceratedPopulation ||
        0,
    });
  }, [modelInputs, localeDataSource, baselinePopulations, facilities]);

  return systemWideData;
}
