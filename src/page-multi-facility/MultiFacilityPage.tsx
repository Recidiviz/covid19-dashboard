import React from "react";
import styled from "styled-components";

import SiteHeader from "../site-header/SiteHeader";
import AddFacilityModal from "./AddFacilityModal";
import ToggleRow from "./ToggleRow";

const MultiFacilityPageDiv = styled.div``;

const MultiFacilityPage: React.FC = () => {
  return (
    <MultiFacilityPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          <main className="my-6">
            <ToggleRow
              label="Daily Reports"
              labelHelp="Tooltip help Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            />
            <ToggleRow
              label="Data Sharing"
              labelHelp="Tooltip help Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            />
            <div className="flex flex-col flex-1 pb-6 py-5">
              <AddFacilityModal />
            </div>
          </main>
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
