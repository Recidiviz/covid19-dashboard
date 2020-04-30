import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { getFacilities } from "../database";
import Colors, { MarkColors } from "../design-system/Colors";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import CurveChart from "../impact-dashboard/CurveChart";
import {
  EpidemicModelState,
  getLocaleDefaults,
} from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import ProjectionsLegend from "../page-multi-facility/ProjectionsLegend";
import { Facilities } from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import {
  getCurveChartData,
  getSystemWideSums,
  originalProjection,
} from "./responseChartData";

const ResponseImpactDashboardContainer = styled.div``;
const ScenarioName = styled.div`
  font-family: Poppins;
  font-size: 10px;
  font-weight: normal;
  line-height: 150%;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${Colors.green};
  padding: 10px 0;
`;
const PageHeader = styled.h1`
  color: ${Colors.forest};
  font-family: "Libre Baskerville";
  font-weight: normal;
  font-size: 24px;
  line-height: 24px;
  letter-spacing: -0.06em;
  padding: 24px 0;
`;
const SectionHeader = styled.h1`
  color: ${Colors.forest};
  border-top: 1px solid ${Colors.opacityGray};
  font-family: "Libre Baskerville";
  font-weight: normal;
  font-size: 19px;
  line-height: 24px;
  letter-spacing: -0.06em;
  padding: 32px 0 24px;
`;
const PlaceholderSpace = styled.div`
  border: 1px solid ${Colors.gray};
  background-color: ${Colors.darkGray};
  height: 200px;
  margin: 20px 0;
  width: 100%;
`;
const ChartHeader = styled.h3<{ color?: string }>`
  border-top: 1px solid ${Colors.opacityGray};
  border-bottom: 1px solid ${Colors.opacityGray};
  color: ${(props) => props.color || Colors.opacityForest};
  display: flex;
  font-family: "Poppins";
  font-style: normal;
  font-weight: 600;
  font-size: 9px;
  justify-content: space-between;
  line-height: 16px;
  margin-bottom: 15px;
  padding: 5px 0;
`;
const SectionSubheader = styled.h2`
  color: ${Colors.darkForest};
  font-family: "Poppins";
  font-weight: normal;
  font-size: 10px;
  line-height: 150%;
  letter-spacing: 0.15em;
  padding: 32px 0 24px;
  text-transform: uppercase;
`;

const ResponseImpactDashboard: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const [scenarioState] = useScenario();
  const [modelInputs, setModelInputs] = useState([] as EpidemicModelState[]);
  const [originalModelInputs, setOriginalModelInputs] = useState(
    [] as EpidemicModelState[],
  );
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

  function getModelInputs(facilities: Facilities) {
    return facilities.map((facility) => {
      const modelInputs = facility.modelInputs;
      return {
        ...modelInputs,
        ...getLocaleDefaults(
          localeDataSource,
          modelInputs.stateCode,
          modelInputs.countyName,
        ),
      };
    });
  }

  async function fetchFacilities() {
    if (!scenarioState?.data?.id) return;
    const facilitiesData = await getFacilities(scenarioState.data.id);
    if (facilitiesData) {
      setFacilities({
        data: facilitiesData,
        loading: false,
      });

      const modelInputs = getModelInputs(facilitiesData);
      setModelInputs(modelInputs);
    }
  }

  useEffect(() => {
    fetchFacilities();
  }, [scenarioState?.data?.id]);

  useEffect(() => {
    if (modelInputs.length === 0) return;
    let originalInputs = getModelInputs(originalProjection(systemWideData));

    setOriginalModelInputs(originalInputs);
  }, [modelInputs, systemWideData]);

  useEffect(() => {
    if (modelInputs.length === 0) return;

    setSystemWideData({
      ...getSystemWideSums(modelInputs),
      prisonPopulation: getLocaleDefaults(
        localeDataSource,
        modelInputs[0].stateCode,
      ).totalPrisonPopulation,
    });
  }, [modelInputs]);

  // NOTE: Replace with CurveChart with CurveChartContainer
  // after it's modified to take curve data as prop
  return (
    <ResponseImpactDashboardContainer>
      {scenarioState.loading ? (
        <Loading />
      ) : (
        <PageContainer>
          <Column width={"55%"}>
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
            <PlaceholderSpace />
            <SectionHeader>Community Resources Saved</SectionHeader>
            <ChartHeader>Change in rate of transmission R(0)</ChartHeader>
            <PlaceholderSpace />
            <SectionSubheader>
              Positive impact of Reducing R(0)
            </SectionSubheader>
            <PlaceholderSpace />
          </Column>
          <Column width={"45%"}>
            <ChartHeader>
              Original Projection
              <ProjectionsLegend />
            </ChartHeader>
            <CurveChart
              chartHeight={144}
              hideAxes={true}
              hospitalBeds={systemWideData.hospitalBeds}
              markColors={MarkColors}
              curveData={getCurveChartData(originalModelInputs)}
            />
            <ChartHeader color={Colors.teal}>
              Current Projection
              <ProjectionsLegend />
            </ChartHeader>
            <CurveChart
              chartHeight={144}
              hideAxes={true}
              hospitalBeds={systemWideData.hospitalBeds}
              markColors={MarkColors}
              curveData={getCurveChartData(modelInputs)}
            />
          </Column>
        </PageContainer>
      )}
    </ResponseImpactDashboardContainer>
  );
};

export default ResponseImpactDashboard;
