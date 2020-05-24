export const scenarioRootUrl = "/app/scenario";

export const Routes = {
  Root: {
    name: "root",
    url: `/`,
  },
  Impact: {
    name: "impact",
    url: `/impact`,
  },
  Verify: {
    name: "verify",
    url: `/verify`,
  },
  App: {
    name: "app",
    url: `/app`,
  },
  About: {
    name: "about",
    url: `/about`,
  },
  ScenarioRoot: {
    name: "scenario-root",
    url: `${scenarioRootUrl}`,
  },
  Scenario: {
    name: "scenario",
    url: `${scenarioRootUrl}/:scenarioId`,
  },
  Facility: {
    name: "facility",
    url: `${scenarioRootUrl}/:scenarioId/facility/:facilityId`,
  },
};
