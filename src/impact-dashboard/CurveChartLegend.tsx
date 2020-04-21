import classNames from "classnames";
import styled from "styled-components";

import { MarkColors } from "./ChartArea";

const LegendWrapper = styled.div`
  display: flex;
`;

const LegendItem = styled.button`
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.15em;
  border-bottom: 1px solid;
  border-color: ${(props) => props.color};
  margin: 0 1em;
  font-weight: normal;
  padding-bottom: 0.6em;
  cursor: pointer;

  &.toggled-off {
    border: none;
    opacity: 0.5;
  }
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
  const toggledOffClass = (key: string) => ({
    "toggled-off": !groupStatus[key],
  });

  return (
    <LegendWrapper>
      <LegendItem
        className={classNames(toggledOffClass("exposed"))}
        onClick={() => toggleGroup("exposed")}
        color={markColors.exposed}
      >
        exposed
      </LegendItem>
      <LegendItem
        className={classNames(toggledOffClass("infectious"))}
        onClick={() => toggleGroup("infectious")}
        color={markColors.infectious}
      >
        infectious
      </LegendItem>
      <LegendItem
        className={classNames(toggledOffClass("hospitalized"))}
        onClick={() => toggleGroup("hospitalized")}
        color={markColors.hospitalized}
      >
        hospitalized
      </LegendItem>
      <LegendItem
        className={classNames(toggledOffClass("fatalities"))}
        onClick={() => toggleGroup("fatalities")}
        color={markColors.fatalities}
      >
        fatalities
      </LegendItem>
    </LegendWrapper>
  );
};

export default CurveChartLegend;
