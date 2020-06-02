import classNames from "classnames";
import sortBy from "lodash/sortBy";
import React from "react";
import styled from "styled-components";

import { ProjectionColors } from "../design-system/Colors";
import { SeirCompartmentKeys, seirIndex } from "../infection-model/seir";

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
  markColors: ProjectionColors;
  toggleGroup: Function;
  groupStatus: {
    [propName in SeirCompartmentKeys]?: boolean;
  };
}

const CurveChartLegend: React.FC<Props> = ({
  markColors,
  toggleGroup,
  groupStatus,
}) => {
  const toggledOffClass = (key: SeirCompartmentKeys) => ({
    "toggled-off": !groupStatus[key],
  });

  return (
    <LegendWrapper>
      {(sortBy(Object.keys(groupStatus), [
        (key: SeirCompartmentKeys) => {
          return seirIndex[key];
        },
      ]) as SeirCompartmentKeys[]).map((key) => (
        <LegendItem
          key={key}
          className={classNames(toggledOffClass(key))}
          onClick={() => toggleGroup(key)}
          color={markColors[key]}
        >
          {key}
        </LegendItem>
      ))}
    </LegendWrapper>
  );
};

export default CurveChartLegend;
