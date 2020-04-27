import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import Loading from "../design-system/Loading";
import useScenario from "../scenario-context/useScenario";

const ResponseImpactDashboardContainer = styled.div``;
const ScenarioName = styled.div`
  font-family: Poppins;
  font-size: 10px;
  font-weight: normal;
  line-height: 150%;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${Colors.forest};
  padding: 10px 0;
`;

const ResponseImpactDashboard: React.FC = () => {
  const [scenarioState] = useScenario();
  const scenario = scenarioState.data;

  return (
    <ResponseImpactDashboardContainer>
      {scenarioState.loading ? (
        <Loading />
      ) : (
        <ScenarioName>{scenario?.name}</ScenarioName>
      )}
    </ResponseImpactDashboardContainer>
  );
};

export default ResponseImpactDashboard;
