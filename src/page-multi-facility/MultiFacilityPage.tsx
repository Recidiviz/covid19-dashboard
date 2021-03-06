import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { useLocaleDataState } from "../locale-data-context";
import useScenario from "../scenario-context/useScenario";
import SiteHeader from "../site-header/SiteHeader";
import CreateBaselineScenarioPage from "./CreateBaselineScenarioPage";
import MultiFacilityImpactDashboard from "./MultiFacilityImpactDashboard";
import ReadOnlyScenarioBanner from "./ReadOnlyScenarioBanner";
import { ReferenceDataModalProvider } from "./ReferenceDataModal/context/ReferenceDataModalContext";

const MultiFacilityPageDiv = styled.div``;

const MultiFacilityPage: React.FC = () => {
  const localeState = useLocaleDataState();
  const [scenario, dispatchScenarioUpdate] = useScenario();

  return (
    <MultiFacilityPageDiv>
      {scenario.data && (
        <ReadOnlyScenarioBanner
          scenario={scenario.data}
          dispatchScenarioUpdate={dispatchScenarioUpdate}
        />
      )}
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          {localeState.failed ? (
            // TODO: real error state?
            <div>
              Unable to load state and county data. Please try refreshing the
              page.
            </div>
          ) : localeState.loading || scenario.loading ? (
            <div className="mt-16">
              <Loading />
            </div>
          ) : scenario.data ? (
            <ReferenceDataModalProvider syncType="all">
              <MultiFacilityImpactDashboard />
            </ReferenceDataModalProvider>
          ) : (
            <CreateBaselineScenarioPage />
          )}
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
