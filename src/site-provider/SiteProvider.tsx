import { navigate } from "gatsby";
import React, { useState } from "react";

import config from "../auth/auth_config.json";
import { Auth0Provider } from "../auth/react-auth0-spa";
import { FeatureFlagsProvider } from "../feature-flags";
import { LocaleDataProvider } from "../locale-data-context";
import { FacilityContext } from "../page-multi-facility/FacilityContext";
import { ScenarioProvider } from "../scenario-context";

// A function that routes the user to the right place
// after login
const onRedirectCallback = (appState: any) => {
  navigate(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname,
  );
};

const SiteProvider: React.FC = (props) => {
  const [facility, setFacility] = useState();

  let redirectUri =
    typeof window === "undefined" ? undefined : window.location.origin;

  return (
    <FeatureFlagsProvider>
      <Auth0Provider
        domain={config.domain}
        client_id={config.clientId}
        audience={config.audience}
        redirect_uri={redirectUri}
        onRedirectCallback={onRedirectCallback as any}
      >
        <LocaleDataProvider>
          <ScenarioProvider>
            <FacilityContext.Provider value={{ facility, setFacility }}>
              {props.children}
            </FacilityContext.Provider>
          </ScenarioProvider>
        </LocaleDataProvider>
      </Auth0Provider>
    </FeatureFlagsProvider>
  );
};

export default SiteProvider;
