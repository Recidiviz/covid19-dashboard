import React from "react";
import styled from "styled-components";

import Loading from "../components/design-system/Loading";
import SiteHeader from "../components/site-header/SiteHeader";
import { useLocaleDataState } from "../contexts/locale-data-context";
import useScenario from "../contexts/scenario-context/useScenario";
import ResponseImpactDashboard from "./ResponseImpactDashboard";

const ResponseImpactPageDiv = styled.div``;

const ResponseImpactPage: React.FC = () => {
  const localeState = useLocaleDataState();
  const [scenario, dispatchScenarioUpdate] = useScenario();

  return (
    <ResponseImpactPageDiv>
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
            <Loading />
          ) : (
            scenario.data && (
              <ResponseImpactDashboard
                scenario={scenario.data}
                dispatchScenarioUpdate={dispatchScenarioUpdate}
              />
            )
          )}
        </div>
      </div>
    </ResponseImpactPageDiv>
  );
};

export default ResponseImpactPage;
