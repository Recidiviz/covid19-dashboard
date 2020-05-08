import { reverse } from "lodash";
import { useEffect, useState } from "react";

import {
  EpidemicModelState,
  getLocaleDefaults,
} from "../../impact-dashboard/EpidemicModelContext";
import { LocaleData, LocaleRecord } from "../../locale-data-context";
import { Scenario } from "../../page-multi-facility/types";
import { getSystemWideSums, SystemWideData } from "../responseChartData";

export function useSystemWideData(
  baselinePopulations: Scenario["baselinePopulations"],
  systemType: string | undefined,
  modelInputs: EpidemicModelState[],
  localeDataSource: LocaleData,
) {
  const [systemWideData, setSystemWideData] = useState<SystemWideData>({
    hospitalBeds: 0,
    staffPopulation: 0,
    incarceratedPopulation: 0,
  });

  useEffect(() => {
    if (modelInputs.length === 0) return;

    // Reverse the populations array to get the most recently modelled populations
    const {
      staffPopulation: userInputStaffPopulation,
      incarceratedPopulation: userInputIncarceratedPopulation,
    } = reverse(baselinePopulations)[0];

    const localeDefaults: Partial<LocaleRecord> = getLocaleDefaults(
      localeDataSource,
      modelInputs[0].stateCode,
      modelInputs[0].countyName,
    );

    const localeDefaultPrisonPopulation =
      systemType && systemType === "State Prison"
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
  }, [modelInputs, localeDataSource, baselinePopulations, systemType]);

  return systemWideData;
}
