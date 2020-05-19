import React from "react";

import PanelHeader, { PanelHeaderText } from "./PanelHeader";
import ProjectionsLegend from "./ProjectionsLegend";

const ProjectionsHeader: React.FC = () => {
  return (
    <PanelHeader>
      <div className="w-2/5 flex flex-row">
        <PanelHeaderText className="w-1/6">Cases</PanelHeaderText>
        <PanelHeaderText className="w-1/4">Residents</PanelHeaderText>
        <PanelHeaderText className="w-2/4">Facility</PanelHeaderText>
      </div>
      <ProjectionsLegend />
    </PanelHeader>
  );
};

export default ProjectionsHeader;
