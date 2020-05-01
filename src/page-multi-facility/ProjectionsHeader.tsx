import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import ProjectionsLegend, { LegendText } from "./ProjectionsLegend";

const HeaderContainer = styled.div`
  border-color: ${Colors.opacityGray};
`;

const ProjectionsHeader: React.FC = () => {
  return (
    <HeaderContainer className="border-t border-b mt-5 mb-5 py-2 flex flex-row">
      <div className="w-2/5 flex flex-row">
        <LegendText className="w-1/4">Cases</LegendText>
        <LegendText className="w-3/4">Facility</LegendText>
      </div>
      <ProjectionsLegend />
    </HeaderContainer>
  );
};

export default ProjectionsHeader;
