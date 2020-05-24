import { navigate } from "gatsby";
import React, { useReducer, useState } from "react";
import { ToastProvider } from "react-toast-notifications";

import Toast from "../../components/design-system/Toast";
import {
  FacilityContext,
  rtDataReducer,
} from "../../contexts/facility-context/FacilityContext";
import { LocaleDataProvider } from "../../contexts/locale-data-context";
import { ScenarioProvider } from "../../contexts/scenario-context";
import { Facility } from "../../page-multi-facility/types";
import AppAuth0ClientPromise from "../auth/AppAuth0ClientPromise";
import { Auth0Provider } from "../auth/react-auth0-spa";
import { FeatureFlagsProvider } from "../feature-flags";

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
      <Auth0Provider
        auth0ClientPromise={AppAuth0ClientPromise}
        onRedirectCallback={onRedirectCallback as any}
      >
        <LocaleDataProvider>
          <ScenarioProvider>
            <FacilityContext.Provider
              value={{ facility, setFacility, rtData, dispatchRtData }}
            >
              <ToastProvider
                placement="bottom-center"
                transitionDuration={0}
                components={{ Toast }}
              >
                {props.children}
              </ToastProvider>
            </FacilityContext.Provider>
          </ScenarioProvider>
        </LocaleDataProvider>
      </Auth0Provider>
    </FeatureFlagsProvider>
  );
};

export default SiteProvider;
