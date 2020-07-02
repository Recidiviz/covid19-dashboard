import React, { useEffect } from "react";

import { STATE_PRISON } from "../../constants";
import {
  getScenarioByStateName,
  getSharedBaselineScenarios,
  referenceFacilitiesProp,
} from "../../database";
import { ReferenceFacilityMapping } from "../../facilities-context";
import {
  buildCompositeFacilities,
  fetchReferenceFacilities,
  fetchUserFacilities,
} from "../../facilities-context/actions";
import {
  Facilities,
  ReferenceFacility,
  Scenario,
} from "../../page-multi-facility/types";
import * as actions from "./actions";
import { weeklyReportReducer } from "./reducer";

export interface WeeklyReportState {
  loading: boolean;
  stateName: string | null;
  scenario: Scenario | null;
  sharedScenarios: Scenario[];
  facilities: Facilities | ReferenceFacility[];
}

type WeeklyReportDispatch = (action: any) => void;

interface WeeklyReportContext {
  state: WeeklyReportState;
  dispatch: WeeklyReportDispatch;
}

const WeeklyReportContext = React.createContext<
  WeeklyReportContext | undefined
>(undefined);

export const WeeklyReportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(weeklyReportReducer, {
    loading: false,
    stateName: null,
    scenario: null,
    sharedScenarios: [],
    facilities: [],
  });

  useEffect(() => {
    dispatch({ type: actions.REQUEST_SHARED_SCENARIOS });
    getSharedBaselineScenarios().then((scenarios) => {
      if (scenarios) {
        dispatch({
          type: actions.RECEIVE_SHARED_SCENARIOS,
          payload: scenarios,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (state.stateName) {
      getScenarioByStateName(state.sharedScenarios, state.stateName).then(
        (scenario) => {
          dispatch({
            type: actions.RECEIVE_SCENARIO,
            payload: scenario || null,
          });
        },
      );
    }
  }, [state.stateName, state.sharedScenarios]);

  useEffect(() => {
    const systemType = STATE_PRISON;

    async function fetchFacilities(
      scenario: Scenario | null,
      stateName: string | null,
    ) {
      let referenceFacilities: ReferenceFacilityMapping = {};

      if (stateName) {
        referenceFacilities = await fetchReferenceFacilities(
          stateName,
          systemType,
        );

        if (scenario && scenario.useReferenceData) {
          let facilities = await fetchUserFacilities(scenario.id);
          facilities = buildCompositeFacilities(
            facilities,
            referenceFacilities,
            scenario[referenceFacilitiesProp],
          );
          dispatch({
            type: actions.RECEIVE_FACILITIES,
            payload: Object.values(facilities),
          });
        } else {
          const facilities = Object.values(referenceFacilities).map(
            (refFacility: ReferenceFacility) => {
              return Object.assign({}, refFacility, {
                name: refFacility.canonicalName,
                systemType: refFacility.facilityType,
                modelInputs: { observedAt: new Date() },
                updatedAt: refFacility.createdAt,
              });
            },
          );
          dispatch({ type: actions.RECEIVE_FACILITIES, payload: facilities });
        }
      }
    }

    fetchFacilities(state.scenario, state.stateName);
  }, [state.stateName, state.scenario]);

  return (
    <WeeklyReportContext.Provider value={{ state, dispatch }}>
      {children}
    </WeeklyReportContext.Provider>
  );
};

export function useWeeklyReport() {
  const context = React.useContext(WeeklyReportContext);

  if (context === undefined) {
    throw new Error(
      "useWeeklyReport must be used within a WeeklyReportProvider",
    );
  }

  return context;
}
