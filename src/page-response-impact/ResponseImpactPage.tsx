import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import { useLocaleDataState } from "../locale-data-context";
import useScenario from "../scenario-context/useScenario";
import SiteHeader from "../site-header/SiteHeader";
import ResponseImpactDashboard from "./ResponseImpactDashboard";

const ResponseImpactPageDiv = styled.div``;

const ResponseImpactPage: React.FC = () => {
  const localeState = useLocaleDataState();
  const [scenario, dispatchScenarioUpdate] = useScenario();
  const {
    state: { loading, facilities: facilitiesState, rtData },
  } = useFacilities();
  const facilities = Object.values(facilitiesState);

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
                loading={loading}
                facilities={facilities}
                rtData={rtData}
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
