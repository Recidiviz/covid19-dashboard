import styled from "styled-components";

import colors from "../design-system/colors";
import CurveChart from "./CurveChartContainer";
import CurveChartLegend from "./CurveChartLegend";

type MarkColors = {
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
    exposed: colors.green,
    infectious: colors.red,
    hospitalized: colors.lightBlue,
    hospitalBeds: colors.red,
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
export { MarkColors };
