import React from "react";
import styled from "styled-components";

import { MarkColors as markColors } from "../design-system/Colors";
import { PanelHeaderText } from "./PanelHeader";

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

const LegendCircle = styled.div`
  background-color: ${(props) => props.color};
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: 4px;
`;

const ProjectionsLegend: React.FC = () => {
  return (
    <div className="w-3/5 flex flex-row justify-start">
      <LegendItem className="mr-6">
        <LegendCircle color={markColors.fatalities} />
        <PanelHeaderText>Fatalities</PanelHeaderText>
      </LegendItem>
      <LegendItem className="mr-6">
        <LegendCircle color={markColors.exposed} />
        <PanelHeaderText>Exposed</PanelHeaderText>
      </LegendItem>
      <LegendItem className="mr-6">
        <LegendCircle color={markColors.infectious} />
        <PanelHeaderText>Infectious</PanelHeaderText>
      </LegendItem>
      <LegendItem className="mr-6">
        <LegendCircle color={markColors.hospitalized} />
        <PanelHeaderText>Hospitalized</PanelHeaderText>
      </LegendItem>
    </div>
  );
};

export default ProjectionsLegend;
