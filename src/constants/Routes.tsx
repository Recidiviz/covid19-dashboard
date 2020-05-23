export const scenarioRootUrl = '/app/scenario';

export const Routes = {
  Scenario: {
    name: "scenario",
    url: `${scenarioRootUrl}/:scenarioId`,
  },
  Facility: {
    name: "facility",
    url: `${scenarioRootUrl}/:scenarioId/facility/:facilityId`,
  },
  FacilityNew: {
    name: "facility-new",
    url: `${scenarioRootUrl}/:scenarioId/facility/new`,
  },
};
