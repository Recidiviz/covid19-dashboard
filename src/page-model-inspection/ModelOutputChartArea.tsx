import React from "react";
import styled from "styled-components";

import ModelOutputChart from "./ModelOutputChartContainer";
import ModelOutputChartLegend from "./ModelOutputChartLegend";

const Container = styled.div``;

const LegendAndActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 40px;
`;

const LegendContainer = styled.div`
  flex: 0 0 auto;
`;

const ModelOutputChartArea: React.FC = () => {
  return (
    <Container>
      <LegendAndActions>
        <LegendContainer>
          <ModelOutputChartLegend />
        </LegendContainer>
      </LegendAndActions>
      <ModelOutputChart />
    </Container>
  );
};

export default ModelOutputChartArea;
