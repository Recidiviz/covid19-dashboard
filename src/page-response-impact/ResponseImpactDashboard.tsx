import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import useScenario from "../scenario-context/useScenario";
import PopulationImpactMetrics from "./PopulationImpactMetrics";

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
  font-family: "Poppins";
  font-style: normal;
  font-weight: 600;
  font-size: 9px;
  line-height: 16px;
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
  const [scenarioState] = useScenario();
  const scenario = scenarioState.data;

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
            <PopulationImpactMetrics />
            <SectionHeader>Community Resources Saved</SectionHeader>
            <ChartHeader>Change in rate of transmission R(0)</ChartHeader>
            <PlaceholderSpace />
            <SectionSubheader>
              Positive impact of Reducing R(0)
            </SectionSubheader>
            <PlaceholderSpace />
          </Column>
          <Column width={"45%"}>
            <ChartHeader>Original Projection</ChartHeader>
            <PlaceholderSpace />
            <ChartHeader color={Colors.teal}>Current Projection</ChartHeader>
            <PlaceholderSpace />
          </Column>
        </PageContainer>
      )}
    </ResponseImpactDashboardContainer>
  );
};

export default ResponseImpactDashboard;
