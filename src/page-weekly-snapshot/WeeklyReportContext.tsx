import React, { useEffect } from "react";

import {
  getSharedBaselineScenarios,
  getSharedScenarioByStateName,
} from "../database";
import { Facilities, Scenario } from "../page-multi-facility/types";

export interface WeeklyReportState {
  loading: boolean;
  stateName: string | null;
  scenario: Scenario | null;
  sharedScenarios: Scenario[];
  facilities: Facilities;
}

type WeeklyReportActions =
  | SharedScenariosAction
  | RequestActions
  | ScenarioAction
  | StateNameAction;

type SharedScenariosAction = {
  type: "RECEIVE_SHARED_SCENARIOS";
  payload: Scenario[];
};

type ScenarioAction = {
  type: "RECEIVE_SCENARIO";
  payload: Scenario | null;
};

type StateNameAction = {
  type: "UPDATE_STATE_NAME";
  payload: string;
};

type RequestActions = {
  type: "REQUEST_SHARED_SCENARIOS";
};

type WeeklyReportDispatch = (action: any) => void;

type ExportedActions = {};

interface WeeklyReportContext {
  state: WeeklyReportState;
  dispatch: WeeklyReportDispatch;
  actions: ExportedActions;
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

  const actions = {};

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
  }, [state.stateName, state.sharedScenarios, getSharedScenarioByStateName]);

  return (
    <WeeklyReportContext.Provider value={{ state, dispatch, actions }}>
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
