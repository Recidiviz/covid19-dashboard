/* eslint-disable filenames/match-exported */
import React from "react";

import AuthWall from "../auth/AuthWall";
import Loading from "../design-system/Loading";
import { useLocaleDataState } from "../locale-data-context";
import CreateBaselineScenarioPage from "../page-multi-facility/CreateBaselineScenarioPage";
import ReadOnlyScenarioBanner from "../page-multi-facility/ReadOnlyScenarioBanner";
import useScenario from "../scenario-context/useScenario";

const LocalStateCheckContainer = (props: { children: any }) => {
  const localeState = useLocaleDataState();
  const [scenario, dispatchScenarioUpdate] = useScenario();

  return (
    <AuthWall>
      {scenario.data && (
        <ReadOnlyScenarioBanner
          scenario={scenario.data}
          dispatchScenarioUpdate={dispatchScenarioUpdate}
        />
      )}
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          {localeState.failed ? (
            // TODO: real error state?
            <div>
              Unable to load state and county data. Please try refreshing the
              page.
            </div>
          ) : (
            props.children
          )}
        </div>
      </div>
    </AuthWall>
  );
};

const LoadingCheckContainer = (props: { children: any }) => {
  const localeState = useLocaleDataState();
  const [scenario] = useScenario();

  return (
    <LocalStateCheckContainer>
      {localeState.loading || scenario.loading ? (
        <div className="mt-16">
          <Loading
            styles={{
              marginTop: "40px",
              minHeight: "350px",
            }}
          />
        </div>
      ) : (
        props.children
      )}
    </LocalStateCheckContainer>
  );
};

// eslint-disable-next-line react/display-name
export default (props: { children: any }) => {
  const [scenario] = useScenario();

  const appContent = props.children;

  return (
    <LoadingCheckContainer>
      {scenario.data ? appContent : <CreateBaselineScenarioPage />}
    </LoadingCheckContainer>
  );
};
