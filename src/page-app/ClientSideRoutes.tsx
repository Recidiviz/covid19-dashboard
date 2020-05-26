/**
 * Important: This path is initially created in the gatsby-config.js file using the gatsby-plugin-create-client-paths.
 * The pathname params are accessed because of the url fragment in that file.
 */

import React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
} from "react-router-dom";

import { Routes } from "../constants/Routes";
import SiteHeader from "../site-header/SiteHeader";
import DashboardContainer from "./DashboardContainer";
import FacilityContainer from "./facility/FacilityContainer";
import ScenarioContainer from "./scenario/ScenarioContainer";
import Scenario from "./scenario/ScenarioContent";

interface FacilityParamProps {
  scenarioId: string;
  facilityId: string;
}

const ClientSideRoutes = () => {
  return (
    <DashboardContainer>
      <Router>
        <SiteHeader isApp={true} />
        <Switch>
          <Route
            path={Routes.Facility.url}
            render={({ match }: RouteComponentProps<FacilityParamProps>) => {
              const { scenarioId } = match.params;
              return <FacilityContainer scenarioId={scenarioId} />;
            }}
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
    </DashboardContainer>
  );
};

export default ClientSideRoutes;
