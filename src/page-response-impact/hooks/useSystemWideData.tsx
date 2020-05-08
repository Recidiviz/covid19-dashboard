import { reverse } from "lodash";
import { useEffect, useState } from "react";

import {
  EpidemicModelState,
  getLocaleDefaults,
} from "../../impact-dashboard/EpidemicModelContext";
import { LocaleData, LocaleRecord } from "../../locale-data-context";
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
    hospitalBeds: 0,
    staffPopulation: 0,
    incarceratedPopulation: 0,
  });

  useEffect(() => {
    console.log("useSystemWideData useEffect");
    if (modelInputs.length === 0 || facilities.data.length === 0) return;

    // Reverse the populations array to get the most recently modelled populations
    const populationsCopy = baselinePopulations
      ? reverse([...baselinePopulations])
      : [];

    let userInputStaffPopulation, userInputIncarceratedPopulation;

    if (populationsCopy.length > 0) {
      userInputStaffPopulation = populationsCopy[0].staffPopulation;
      userInputIncarceratedPopulation =
        populationsCopy[0].incarceratedPopulation;
    }

    const localeDefaults: Partial<LocaleRecord> = getLocaleDefaults(
      localeDataSource,
      modelInputs[0].stateCode,
      modelInputs[0].countyName,
    );

    const localeDefaultPrisonPopulation =
      facilities.data[0].systemType === "State Prison"
        ? localeDefaults.totalPrisonPopulation
        : localeDefaults.totalJailPopulation;

    const {
      hospitalBeds,
      staffPopulation: currentStaffPopulation,
    } = getSystemWideSums(modelInputs);

    setSystemWideData({
      hospitalBeds,
      staffPopulation: userInputStaffPopulation || currentStaffPopulation,
      incarceratedPopulation:
        userInputIncarceratedPopulation || localeDefaultPrisonPopulation || 0,
    });
  }, [modelInputs, localeDataSource, baselinePopulations, facilities]);

  return systemWideData;
}
