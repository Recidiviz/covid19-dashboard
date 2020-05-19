export const Routes = {
  Scenario: {
    name: "scenario",
    base: "/scenario",
    params: {
      scenarioId: "/:scenarioId",
    },
    url: "/scenario/:scenarioId",
  },
  Facility: {
    name: "facility",
    base: "/scenario/:scenarioId/facility",
    params: {
      scenarioId: "/:scenarioId",
      facilityId: "/:facilityId",
    },
    url: "/scenario/:scenarioId/facility/:facilityId",
  },
  FacilityNew: {
    name: "facility-new",
    base: "/scenario/:scenarioId/facility/new",
    params: {
      scenarioId: "/:scenarioId",
    },
    url: "/scenario/:scenarioId/facility/new",
  },
};
