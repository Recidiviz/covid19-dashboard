import { navigate } from "gatsby";
import React, { useReducer, useState } from "react";
import { ToastProvider } from "react-toast-notifications";

import AppAuth0ClientPromise from "../auth/AppAuth0ClientPromise";
import { Auth0Provider } from "../auth/react-auth0-spa";
import Toast from "../design-system/Toast";
import { FeatureFlagsProvider } from "../feature-flags";
import { LocaleDataProvider } from "../locale-data-context";
import { FacilitiesProvider } from "../facilities-context/FacilitiesContext";
import {
  FacilityContext,
  rtDataReducer,
} from "../page-multi-facility/FacilityContext";
import { Facility } from "../page-multi-facility/types";
import { ScenarioProvider } from "../scenario-context";

// A function that routes the user to the right place after login
const onRedirectCallback = (appState: any) => {
  navigate(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname,
  );
};

const SiteProvider: React.FC = (props) => {
  const [facility, setFacility] = useState<Facility | undefined>();
  const [rtData, dispatchRtData] = useReducer(rtDataReducer, {});

  return (
    <FeatureFlagsProvider>
      <ToastProvider
        placement="bottom-center"
        transitionDuration={0}
        components={{ Toast }}
      >
        <Auth0Provider
          auth0ClientPromise={AppAuth0ClientPromise}
          onRedirectCallback={onRedirectCallback as any}
        >
          <LocaleDataProvider>
            <ScenarioProvider>
              <FacilitiesProvider>
                <FacilityContext.Provider
                  value={{ facility, setFacility, rtData, dispatchRtData }}
                >
                  {props.children}
                </FacilityContext.Provider>
              </FacilitiesProvider>
            </ScenarioProvider>
          </LocaleDataProvider>
        </Auth0Provider>
      </ToastProvider>
    </FeatureFlagsProvider>
  );
};

export default SiteProvider;
