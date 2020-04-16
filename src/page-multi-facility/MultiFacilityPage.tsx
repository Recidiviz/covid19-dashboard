import React from "react";
import styled from "styled-components";

import PromoBoxWithButton from "../design-system/PromoBoxWithButton";
import SiteHeader from "../site-header/SiteHeader";
import ToggleRow from "./ToggleRow";

const LeftColumn = styled.div`
  width: 300px;
`;
const MultiFacilityPageDiv = styled.div``;

const MultiFacilityPage: React.FC = () => {
  return (
    <MultiFacilityPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          <main className="my-6">
            <LeftColumn>
              <ToggleRow
                label="Daily Reports"
                labelHelp="Tooltip help Lorem ipsum dolor sit amet, consectetur adipiscing elit"
              />
              <ToggleRow
                label="Data Sharing"
                labelHelp="Tooltip help Lorem ipsum dolor sit amet, consectetur adipiscing elit"
              />
              <PromoBoxWithButton
                text={
                  "Turn on 'DailyReports' to receive Lorem ipsum dolor sit amet, consectetur adipiscing elit"
                }
              />
            </LeftColumn>
          </main>
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
