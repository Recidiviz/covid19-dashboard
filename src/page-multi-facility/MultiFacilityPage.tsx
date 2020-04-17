import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { getBaselineScenarioRef } from "../database";
import Loading from "../design-system/Loading";
import SiteHeader from "../site-header/SiteHeader";
import CreateBaselineScenarioPage from "./CreateBaselineScenarioPage";
import MultiFacilityImpactDashboard from "./MultiFacilityImpactDashboard";

const MultiFacilityPageDiv = styled.div``;

const MultiFacilityPage: React.FC = () => {
  const [hasBaselineScenario, setHasBaselineScenario] = useState({
    data: false,
    loading: true,
  });

  useEffect(() => {
    async function fetchBaselineScenarioRef() {
      const baselineScenarioRef = await getBaselineScenarioRef();

      setHasBaselineScenario({
        data: !!baselineScenarioRef,
        loading: false,
      });
    }
    fetchBaselineScenarioRef();
  }, []);

  return (
    <MultiFacilityPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          {hasBaselineScenario.loading ? (
            <Loading />
          ) : hasBaselineScenario.data ? (
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
