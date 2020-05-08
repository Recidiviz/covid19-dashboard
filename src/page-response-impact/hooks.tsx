import { reverse } from "lodash";
import { useEffect, useState } from "react";

import { getFacilities } from "../database";
import {
  EpidemicModelState,
  getLocaleDefaults,
} from "../impact-dashboard/EpidemicModelContext";
import { CurveFunctionInputs } from "../infection-model";
import { LocaleData, LocaleRecord } from "../locale-data-context";
import { Facilities, Scenario } from "../page-multi-facility/types";
import {
  calculateCurveData,
  getCurveInputs,
  getModelInputs,
  getSystemWideSums,
  originalProjection,
  SystemWideData,
} from "./responseChartData";
import {
  buildReductionData,
  buildResponseImpactCardData,
  reductionCardDataType,
} from "./utils/ResponseImpactCardStateUtils";

type FacilitiesState = {
  data: Facilities;
  loading: boolean;
};

export function useFacilities(
  scenarioId: string,
  localeDataSource: LocaleData,
) {
  const [facilities, setFacilities] = useState<FacilitiesState>({
    data: [],
    loading: true,
  });

  useEffect(() => {
    async function fetchFacilities() {
      if (!scenarioId) return;
      const facilitiesData = await getFacilities(scenarioId);
      if (facilitiesData) {
        setFacilities({
          data: facilitiesData,
          loading: false,
        });
      }
    }

    fetchFacilities();
  }, [scenarioId, localeDataSource]);

  return facilities;
}

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

export function useSystemWideData(
  scenarioPopulations: Scenario["populations"],
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
    } = reverse(scenarioPopulations)[0];

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
  }, [modelInputs, localeDataSource, scenarioPopulations, systemType]);

  return systemWideData;
}

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

export function useReductionData(
  originalCurveInputs: CurveFunctionInputs[],
  currentCurveInputs: CurveFunctionInputs[],
) {
  const [reductionCardData, setreductionCardData] = useState<
    reductionCardDataType | undefined
  >();

  useEffect(() => {
    const originalCurveDataPerFacility = calculateCurveData(
      originalCurveInputs,
    );
    const origData = buildResponseImpactCardData(originalCurveDataPerFacility);
    const currentCurveDataPerFacility = calculateCurveData(currentCurveInputs);
    const currData = buildResponseImpactCardData(currentCurveDataPerFacility);

    // positive value is a reduction
    const reduction = buildReductionData(origData, currData);

    setreductionCardData(reduction);
  }, [originalCurveInputs, currentCurveInputs]);

  return reductionCardData;
}
