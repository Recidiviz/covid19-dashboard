import React, { useState } from "react";
import styled from "styled-components";

import InputToggle from "../design-system/InputToggle";
import SiteHeader from "../site-header/SiteHeader";
import ToggleRow from "./ToggleRow";

const MultiFacilityPageDiv = styled.div``;

const MultiFacilityPage: React.FC = () => {
  const [toggled, setToggled] = useState(false);

  return (
    <MultiFacilityPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          <main className="my-6">
            <InputToggle
              toggled={toggled}
              onChange={() => setToggled(!toggled)}
            />
            <ToggleRow
              text="Daily Reports"
              textHelp="Tooltip help Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            />
            <ToggleRow
              text="Data Sharing"
              textHelp="Tooltip help Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            />
          </main>
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
