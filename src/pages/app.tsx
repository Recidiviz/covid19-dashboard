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
  Switch,
} from "react-router-dom";

import AuthWall from "../auth/AuthWall";
import Scenario from "../pages-root/Scenario";
import ScenarioContainer from "../pages-root/Scenario/Container";
import Facility from "../pages-root/Scenario/Facility";
import FacilityContainer from "../pages-root/Scenario/Facility/Container";


// eslint-disable-next-line react/display-name
export default () => (
  <AuthWall>
    <Router>
      <Switch>
        <Route path="/app/scenario/:scenarioId/facility/:facilityId">
          <FacilityContainer>
            <Facility />
          </FacilityContainer>  
        </Route>
        <Route path="/app/scenario/:scenarioId/facility/new">
          <FacilityContainer>
            <Facility isNew={true} />
          </FacilityContainer>  
        </Route>
        <Route path="/app/scenario/:scenarioId">
          <ScenarioContainer>
            <Scenario />
          </ScenarioContainer>
        </Route>
        <Route path="/app/scenario">
          <ScenarioContainer>
            <Scenario />
          </ScenarioContainer>
        </Route>
        <Route path="/app">
          <Redirect to="/app/scenario" />
        </Route>
        <Route path="/">
          <Redirect to="/app" />
        </Route>
      </Switch>
    </Router>
  </AuthWall>
);
