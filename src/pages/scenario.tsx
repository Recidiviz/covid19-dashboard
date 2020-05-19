/**
 * Important: This path is initially created in the gatsby-config.js file using the gatsby-plugin-create-client-paths.
 * The pathname params are accessed because of the url fragment in that file.
 */

/* eslint-disable filenames/match-exported */
import { Redirect, Router } from "@reach/router";
import React from "react";

import AuthWall from "../auth/AuthWall";
import { Routes } from "../constants/Routes";
import Facility from "../pages-root/Facility";
import FacilityContainer from "../pages-root/Facility/Container";
import Scenario from "../pages-root/Scenario";
import ScenarioContainer from "../pages-root/Scenario/Container";
import PageInfo from "../site-metadata/PageInfo";

// eslint-disable-next-line react/display-name
export default () => (
  <AuthWall>
    <PageInfo title={"Scenario dashboard"} />
    <Router basepath={Routes.Scenario.base}>
      <FacilityContainer path="/:scenarioId/facility">
        <Facility path="/new" isNew={true} />
        <Facility path={`/${Routes.Facility.params.facilityId}`} />
      </FacilityContainer>
      <ScenarioContainer path="/">
        <Scenario path={`/${Routes.Scenario.params.scenarioId}`} />
      </ScenarioContainer>
    </Router>
  </AuthWall>
);
