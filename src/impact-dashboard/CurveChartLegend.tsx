import styled from "styled-components";

import { MarkColors } from "./ChartArea";

const LegendWrapper = styled.div`
  display: flex;
`;

const LegendItem = styled.div`
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.15em;
  border-bottom: 1px solid;
  border-color: ${(props) => props.color};
  margin: 0 1em;
  font-weight: normal;
  padding-bottom: 0.6em;
`;

interface Props {
  markColors: MarkColors;
}

const CurveChartLegend: React.FC<Props> = ({ markColors }) => {
  return (
    <LegendWrapper>
      <LegendItem color={markColors.exposed}>exposed</LegendItem>
      <LegendItem color={markColors.infectious}>infectious</LegendItem>
      <LegendItem color={markColors.hospitalized}>hospitalized</LegendItem>
    </LegendWrapper>
  );
};

export default CurveChartLegend;
