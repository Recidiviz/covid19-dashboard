import styled from "styled-components";

import Colors, { darken } from "../design-system/Colors";
import CurveChart from "./CurveChartContainer";
import CurveChartLegend from "./CurveChartLegend";

export type MarkColors = {
  exposed: string;
  infectious: string;
  fatalities: string;
  hospitalized: string;
  hospitalBeds: string;
};

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

const ChartArea: React.FC = () => {
  const markColors = {
    exposed: Colors.green,
    fatalities: Colors.black,
    hospitalized: Colors.lightBlue,
    hospitalBeds: darken(Colors.lightBlue, 20),
    infectious: Colors.red,
  };
  return (
    <Container>
      <LegendAndActions>
        <LegendContainer>
          <CurveChartLegend markColors={markColors} />
        </LegendContainer>
      </LegendAndActions>
      <CurveChart markColors={markColors} />
    </Container>
  );
};

export default ChartArea;
