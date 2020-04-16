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
  cursor: pointer;
`;

interface Props {
  markColors: MarkColors;
  toggleGroup: Function;
  groupStatus: {
    [propName: string]: boolean;
  };
}

const CurveChartLegend: React.FC<Props> = ({
  markColors,
  toggleGroup,
  groupStatus,
}) => {
  () => alert("hello");
  return (
    <LegendWrapper>
      <LegendItem
        onClick={() => toggleGroup("exposed")}
        color={markColors.exposed}
      >
        {groupStatus["exposed"] ? "exposed" : "exposed"}
      </LegendItem>
      <LegendItem
        onClick={() => toggleGroup("infectious")}
        color={markColors.infectious}
      >
        {groupStatus["infectious"] ? "infectious" : "infectious"}
      </LegendItem>
      <LegendItem
        onClick={() => toggleGroup("hospitalized")}
        color={markColors.hospitalized}
      >
        {groupStatus["hospitalized"] ? "hospitalized" : "hospitalized"}
      </LegendItem>
      <LegendItem
        onClick={() => toggleGroup("fatalities")}
        color={markColors.fatalities}
      >
        {groupStatus["fatalities"] ? "fatalities" : "fatalities"}
      </LegendItem>
    </LegendWrapper>
  );
};

export default CurveChartLegend;
