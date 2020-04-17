import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { getBaselineScenarioRef } from "../database";
import Loading from "../design-system/Loading";
import { useLocaleDataState } from "../locale-data-context";
import SiteHeader from "../site-header/SiteHeader";
import CreateBaselineScenarioPage from "./CreateBaselineScenarioPage";
import MultiFacilityImpactDashboard from "./MultiFacilityImpactDashboard";

const MultiFacilityPageDiv = styled.div``;

const MultiFacilityPage: React.FC = () => {
  const [hasBaselineScenario, setHasBaselineScenario] = useState({
    data: false,
    loading: true,
  });
  const localeState = useLocaleDataState();

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
          {localeState.failed ? (
            // TODO: real error state?
            <div>
              Unable to load state and county data. Please try refreshing the
              page.
            </div>
          ) : hasBaselineScenario.loading || localeState.loading ? (
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
