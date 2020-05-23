export const scenarioRootUrl = "/app/scenario";

export const Routes = {
  Root: {
    name: "root",
    url: `/`,
  },
  App: {
    name: "app",
    url: `/app`,
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
