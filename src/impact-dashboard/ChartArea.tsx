import styled from "styled-components";

import ColorTheme from "../design-system/ColorTheme";
import CurveChart from "./CurveChartContainer";
import CurveChartLegend from "./CurveChartLegend";

export type MarkColors = {
  exposed: string;
  infectious: string;
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
    exposed: ColorTheme.green,
    infectious: ColorTheme.red,
    hospitalized: ColorTheme.lightBlue,
    hospitalBeds: ColorTheme.red,
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
