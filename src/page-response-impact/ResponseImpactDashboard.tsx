import React, { useContext, useEffect, useState } from "react";

import { getFacilities } from "../database";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import useFacilitiesRtData from "../hooks/useFacilitiesRtData";
import {
  EpidemicModelState,
  getLocaleDefaults,
} from "../impact-dashboard/EpidemicModelContext";
import { CurveFunctionInputs } from "../infection-model";
import { useLocaleDataState } from "../locale-data-context";
import { FacilityContext } from "../page-multi-facility/FacilityContext";
import { Facilities } from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import PopulationImpactMetrics from "./PopulationImpactMetrics";
import ProjectionCharts from "./ProjectionCharts";
import ReducingR0ImpactMetrics from "./ReducingR0ImpactMetrics";
import {
  calculateCurveData,
  getCurveInputs,
  getModelInputs,
  getSystemWideSums,
  originalProjection,
} from "./responseChartData";
import RtSummaryStats from "./RtSummaryStats";
import {
  ChartHeader,
  PageHeader,
  PlaceholderSpace,
  ResponseImpactDashboardContainer,
  ScenarioName,
  SectionHeader,
  SectionSubheader,
} from "./styles";
import {
  buildReductionData,
  buildResponseImpactCardData,
  reductionCardDataType,
} from "./utils/ResponseImpactCardStateUtils";
import ValidDataWrapper from "./ValidDataWrapper";

const ResponseImpactDashboard: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const [scenarioState] = useScenario();
  const { rtData } = useContext(FacilityContext);
  const scenario = scenarioState.data;
  const scenarioId = scenarioState?.data?.id; // linter wants this to be its own var since it is a useEffect dep
  const [currentCurveInputs, setCurrentCurveInputs] = useState(
    [] as CurveFunctionInputs[],
  );
  const [originalCurveInputs, setOriginalCurveInputs] = useState(
    [] as CurveFunctionInputs[],
  );
  const [modelInputs, setModelInputs] = useState([] as EpidemicModelState[]);
  const [systemWideData, setSystemWideData] = useState({
    hospitalBeds: 0,
    staffPopulation: 0,
    prisonPopulation: 0,
  });
  const [reductionCardData, setreductionCardData] = useState<
    reductionCardDataType | undefined
  >();
  const [facilities, setFacilities] = useState({
    data: [] as Facilities,
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

        const modelInputs = getModelInputs(facilitiesData, localeDataSource);
        const currentCurveInputs = getCurveInputs(modelInputs);
        setModelInputs(modelInputs);
        setCurrentCurveInputs(currentCurveInputs);
      }
    }

    fetchFacilities();
  }, [scenarioId, localeDataSource]);

  useFacilitiesRtData(facilities.data, true);

  // calculate data for cards
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

  // calculate original and current curves
  useEffect(() => {
    if (modelInputs.length === 0) return;
    const originalInputs = getModelInputs(
      originalProjection(systemWideData),
      localeDataSource,
    );
    const originalCurveInputs = getCurveInputs(originalInputs);
    setOriginalCurveInputs(originalCurveInputs);
  }, [modelInputs, systemWideData, localeDataSource]);

  // set system wide data
  useEffect(() => {
    if (modelInputs.length === 0) return;

    setSystemWideData({
      ...getSystemWideSums(modelInputs),
      prisonPopulation: getLocaleDefaults(
        localeDataSource,
        modelInputs[0].stateCode,
      ).totalPrisonPopulation,
    });
  }, [modelInputs, localeDataSource]);

  return (
    <ResponseImpactDashboardContainer>
      {modelInputs.length === 0 ? (
        <Loading />
      ) : (
        <ValidDataWrapper facilities={facilities.data}>
          <PageContainer>
            <Column>
              <ScenarioName>{scenario?.name}</ScenarioName>
              <PageHeader>COVID-19 Response Impact as of [DATE]</PageHeader>
              <SectionHeader>Safety of Overall Population</SectionHeader>
              <ChartHeader>
                Reduction in the number of incarcerated individuals
              </ChartHeader>
              <PlaceholderSpace />
              <SectionSubheader>
                Positive impact of releasing [X] incarcerated individuals
              </SectionSubheader>
              <PopulationImpactMetrics
                reductionData={reductionCardData}
                staffPopulation={systemWideData.staffPopulation}
                incarceratedPopulation={systemWideData.prisonPopulation}
              />
              <SectionHeader>Community Resources Saved</SectionHeader>
              <ChartHeader>
                Rate of spread (R(t)) for modelled facilities
              </ChartHeader>
              {rtData && <RtSummaryStats rtData={rtData} />}
              <SectionSubheader>
                Positive impact of Reducing R(0)
              </SectionSubheader>
              <ReducingR0ImpactMetrics />
            </Column>
            <Column>
              <ProjectionCharts
                systemWideData={systemWideData}
                originalCurveInputs={originalCurveInputs}
                currentCurveInputs={currentCurveInputs}
              />
            </Column>
          </PageContainer>
        </ValidDataWrapper>
      )}
    </ResponseImpactDashboardContainer>
  );
};

export default ResponseImpactDashboard;
