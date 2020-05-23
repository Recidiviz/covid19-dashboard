/**
 * Important: This path is initially created in the gatsby-config.js file using the gatsby-plugin-create-client-paths.
 * The pathname params are accessed because of the url fragment in that file.
 */

/* eslint-disable filenames/match-exported */
import React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
} from "react-router-dom";

import {Routes} from '../../constants/Routes';
import SiteHeader from "../../site-header/SiteHeader";
import Layout from "../layout";
import Scenario from "../scenario";
import Facility from "../scenario/facility";
import FacilityContainer from "../scenario/facility/FacilityContainer";
import ScenarioContainer from "../scenario/ScenarioContainer";

interface FacilityParamProps {
  scenarioId: string;
  facilityId: string;
}

// eslint-disable-next-line react/display-name
export default () => {
  return (
    <Layout>
      <Router>
        <SiteHeader />
        <Switch>
          <Route
            path={Routes.Facility.url}
            render={({ match }: RouteComponentProps<FacilityParamProps>) => (
              <FacilityContainer scenarioId={match.params.scenarioId}>
                <Facility />
              </FacilityContainer>
            )}
          />
          <Route path={Routes.Scenario.url}>
            <ScenarioContainer>
              <Scenario />
            </ScenarioContainer>
          </Route>
          <Route path={Routes.ScenarioRoot.url}>
            <ScenarioContainer>
              <Scenario />
            </ScenarioContainer>
          </Route>
          <Route path={Routes.App.url}>
            <Redirect to={Routes.ScenarioRoot.url} />
          </Route>
          <Route path={Routes.Root.url}>
            <Redirect to={Routes.App.url} />
          </Route>
        </Switch>
      </Router>
    </Layout>
  );
};
