import React from "react";
import styled from "styled-components";

import SiteHeader from "../site-header/SiteHeader";

const UnnamedFacilityPageDiv = styled.div``;

const UnnamedFacilityPage: React.FC = () => {
  return (
    <UnnamedFacilityPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
        </div>
      </div>
    </UnnamedFacilityPageDiv>
  );
};

export default UnnamedFacilityPage;
