import styled from "styled-components";

import SiteHeader from "../site-header/SiteHeader";

const MultiFacilityPageDiv = styled.div``;

const MultiFacilityPage: React.FC = () => {
  return (
    <MultiFacilityPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          <main className="my-6" />
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
