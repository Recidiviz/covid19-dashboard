import React from "react";
import styled from "styled-components";

import SiteHeader from "../site-header/SiteHeader";
import AddFacilityModal from "./AddFacilityModal";
import ProjectionsHeader from "./ProjectionsHeader";
import ScenarioSidebar from "./ScenarioSidebar";

const MultiFacilityPageDiv = styled.div``;

const MultiFacilityImpactDashboard = styled.main.attrs({
  className: `
    h-screen
    flex
    mt-8
  `,
})``;

const MultiFacilityPage: React.FC = () => {
  return (
    <MultiFacilityPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          <MultiFacilityImpactDashboard>
            <ScenarioSidebar />
            <div className="flex flex-col flex-1 pb-6 pl-8">
              <AddFacilityModal />
              <ProjectionsHeader />
              <div>Projections will go here</div>
            </div>
          </MultiFacilityImpactDashboard>
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
