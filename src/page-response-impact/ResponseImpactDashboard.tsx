import React, { useEffect, useState } from "react";

import { getFacilities } from "../database";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import {
  EpidemicModelState,
  getLocaleDefaults,
} from "../impact-dashboard/EpidemicModelContext";
import { CurveFunctionInputs } from "../infection-model";
import { useLocaleDataState } from "../locale-data-context";
import { Facilities } from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import PopulationImpactMetrics from "./PopulationImpactMetrics";
import ProjectionCharts from "./ProjectionCharts";
import ReducingR0ImpactMetrics from "./ReducingR0ImpactMetrics";
import {
  getCurveInputs,
  getModelInputs,
  getSystemWideSums,
  originalProjection,
} from "./responseChartData";
import {
  ChartHeader,
  PageHeader,
  PlaceholderSpace,
  ResponseImpactDashboardContainer,
  ScenarioName,
  SectionHeader,
  SectionSubheader,
} from "./styles";

const ResponseImpactDashboard: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const [scenarioState] = useScenario();
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
  const scenario = scenarioState.data;
  const [, setFacilities] = useState({
    data: [] as Facilities,
    loading: true,
  });

  async function fetchFacilities() {
    if (!scenarioState?.data?.id) return;
    const facilitiesData = await getFacilities(scenarioState.data.id);
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

  useEffect(() => {
    fetchFacilities();
  }, [scenarioState?.data?.id]);

  useEffect(() => {
    if (modelInputs.length === 0) return;
    const originalInputs = getModelInputs(
      originalProjection(systemWideData),
      localeDataSource,
    );
    const originalCurveInputs = getCurveInputs(originalInputs);
    setOriginalCurveInputs(originalCurveInputs);
  }, [modelInputs, systemWideData, localeDataSource]);

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
      {scenarioState.loading ? (
        <Loading />
      ) : (
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
            <PopulationImpactMetrics />
            <SectionHeader>Community Resources Saved</SectionHeader>
            <ChartHeader>Change in rate of transmission R(0)</ChartHeader>
            <PlaceholderSpace />
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
      )}
    </ResponseImpactDashboardContainer>
  );
};

export default ResponseImpactDashboard;
