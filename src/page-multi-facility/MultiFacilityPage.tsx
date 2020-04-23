import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { getBaselineScenarioRef } from "../database";
import Loading from "../design-system/Loading";
import { useLocaleDataState } from "../locale-data-context";
import SiteHeader from "../site-header/SiteHeader";
import CreateBaselineScenarioPage from "./CreateBaselineScenarioPage";
import MultiFacilityImpactDashboard from "./MultiFacilityImpactDashboard";

const MultiFacilityPageDiv = styled.div``;

export type ScenarioType = {
  // TODO: Confine uses of Firestore APIs (document references, etc.) to the `database` module and make this type
  //       more specific.
  data?: any;
  loading: boolean;
};

const MultiFacilityPage: React.FC = () => {
  const [baselineScenario, setBaselineScenario] = useState<ScenarioType>({
    data: null,
    loading: true,
  });

  const localeState = useLocaleDataState();

  useEffect(() => {
    async function fetchBaselineScenarioRef() {
      const baselineScenarioRef = await getBaselineScenarioRef();

      setBaselineScenario({
        data: baselineScenarioRef,
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
          ) : baselineScenario.loading || localeState.loading ? (
            <Loading />
          ) : baselineScenario.data ? (
            <MultiFacilityImpactDashboard baselineScenario={baselineScenario} />
          ) : (
            <CreateBaselineScenarioPage />
          )}
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
