import React from "react";
import styled from "styled-components";

import Colors, { MarkColors as markColors } from "../design-system/Colors";

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

export const LegendText = styled.div`
  color: ${Colors.forest};
  opacity: 0.7;
  font-family: "Poppins", sans-serif;
  font-size: 9px;
  font-weight: 600;
  line-height: 16px;
`;

const ProjectionsLegend: React.FC = () => {
  return (
    <div className="w-3/5 flex flex-row justify-start">
      <LegendItem className="mr-6">
        <LegendCircle color={markColors.fatalities} />
        <LegendText>Fatalities</LegendText>
      </LegendItem>
      <LegendItem className="mr-6">
        <LegendCircle color={markColors.exposed} />
        <LegendText>Exposed</LegendText>
      </LegendItem>
      <LegendItem className="mr-6">
        <LegendCircle color={markColors.infectious} />
        <LegendText>Infectious</LegendText>
      </LegendItem>
      <LegendItem className="mr-6">
        <LegendCircle color={markColors.hospitalized} />
        <LegendText>Hospitalized</LegendText>
      </LegendItem>
    </div>
  );
};

export default ProjectionsLegend;
