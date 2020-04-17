import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { getBaselineScenarioRef } from "../database";
import SiteHeader from "../site-header/SiteHeader";
import CreateBaselineScenarioPage from "./CreateBaselineScenarioPage";
import MultiFacilityImpactDashboard from "./MultiFacilityImpactDashboard";

const MultiFacilityPageDiv = styled.div``;

const MultiFacilityPage: React.FC = () => {
  const [hasBaselineScenario, setHasBaselineScenario] = useState(false);

  useEffect(() => {
    async function fetchBaselineScenarioRef() {
      const baselineScenarioRef = await getBaselineScenarioRef();

      if (baselineScenarioRef) {
        setHasBaselineScenario(true);
      }
    }
    fetchBaselineScenarioRef();
  }, []);

  return (
    <MultiFacilityPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          {hasBaselineScenario ? (
            <MultiFacilityImpactDashboard />
          ) : (
            <CreateBaselineScenarioPage />
          )}
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
