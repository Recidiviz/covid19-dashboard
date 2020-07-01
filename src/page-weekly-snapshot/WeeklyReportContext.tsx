import React, { useEffect } from "react";

import {
  getSharedBaselineScenarios,
  getSharedScenarioByStateName,
  referenceFacilitiesProp,
} from "../database";
import {
  buildCompositeFacilities,
  fetchReferenceFacilities,
  fetchUserFacilities,
} from "../facilities-context/actions";
import {
  Facilities,
  ReferenceFacility,
  Scenario,
} from "../page-multi-facility/types";

export interface WeeklyReportState {
  loading: boolean;
  stateName: string | null;
  scenario: Scenario | null;
  sharedScenarios: Scenario[];
  facilities: Facilities | ReferenceFacility[];
}

type WeeklyReportActions =
  | SharedScenariosAction
  | RequestActions
  | ScenarioAction
  | StateNameAction
  | FacilitiesAction;

type SharedScenariosAction = {
  type: "RECEIVE_SHARED_SCENARIOS";
  payload: Scenario[];
};

type ScenarioAction = {
  type: "RECEIVE_SCENARIO";
  payload: Scenario | null;
};

type FacilitiesAction = {
  type: "RECEIVE_FACILITIES";
  payload: Facilities | ReferenceFacility[];
};

type StateNameAction = {
  type: "UPDATE_STATE_NAME";
  payload: string;
};

type RequestActions = {
  type: "REQUEST_SHARED_SCENARIOS";
};

type WeeklyReportDispatch = (action: any) => void;

interface WeeklyReportContext {
  state: WeeklyReportState;
  dispatch: WeeklyReportDispatch;
}

const WeeklyReportContext = React.createContext<
  WeeklyReportContext | undefined
>(undefined);

function weeklyReportReducer(
  state: WeeklyReportState,
  action: WeeklyReportActions,
): WeeklyReportState {
  switch (action.type) {
    case "REQUEST_SHARED_SCENARIOS":
      return Object.assign({}, state, { loading: true });
    case "RECEIVE_SHARED_SCENARIOS":
      return Object.assign({}, state, {
        loading: false,
        sharedScenarios: action.payload,
      });
    case "RECEIVE_SCENARIO":
      return Object.assign({}, state, {
        scenario: action.payload,
      });
    case "UPDATE_STATE_NAME":
      return Object.assign({}, state, {
        stateName: action.payload,
      });
    case "RECEIVE_FACILITIES":
      return Object.assign({}, state, {
        facilities: action.payload,
      });
    default:
      return state;
  }
}

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
    dispatch({ type: "REQUEST_SHARED_SCENARIOS" });
    getSharedBaselineScenarios().then((scenarios) => {
      if (scenarios) {
        dispatch({ type: "RECEIVE_SHARED_SCENARIOS", payload: scenarios });
      }
    });
  }, []);

  useEffect(() => {
    if (state.stateName) {
      getSharedScenarioByStateName(state.sharedScenarios, state.stateName).then(
        (scenario) => {
          dispatch({ type: "RECEIVE_SCENARIO", payload: scenario || null });
        },
      );
    }
  }, [state.stateName, state.sharedScenarios]);

  useEffect(() => {
    const systemType = "State Prison";

    async function fetchFacilities(
      scenario: Scenario | null,
      stateName: string | null,
    ) {
      if (scenario && scenario.useReferenceData && stateName) {
        let facilities = await fetchUserFacilities(scenario.id);
        const referenceFacilities = await fetchReferenceFacilities(
          stateName,
          systemType,
        );

        facilities = buildCompositeFacilities(
          facilities,
          referenceFacilities,
          scenario[referenceFacilitiesProp],
        );
        dispatch({
          type: "RECEIVE_FACILITIES",
          payload: Object.values(facilities),
        });
      } else {
        if (stateName) {
          const referenceFacilities = await fetchReferenceFacilities(
            stateName,
            systemType,
          );
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
          dispatch({ type: "RECEIVE_FACILITIES", payload: facilities });
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
