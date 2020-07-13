import React, { useEffect } from "react";

import {
  getScenariosByStateName,
  getSharedBaselineScenarios,
} from "../../database";
import { Scenario } from "../../page-multi-facility/types";
import useScenario from "../../scenario-context/useScenario";
import * as actions from "./actions";
import { weeklyReportReducer } from "./reducer";

export interface WeeklyReportState {
  loading: boolean;
  stateName: string | null;
  scenario: Scenario | null;
  sharedScenarios: Scenario[];
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
  const [, dispatchScenarioUpdate] = useScenario();
  const [state, dispatch] = React.useReducer(weeklyReportReducer, {
    loading: false,
    stateName: null,
    scenario: null,
    sharedScenarios: [],
  });

  useEffect(() => {
    if (state.scenario) {
      dispatchScenarioUpdate(state.scenario);
    }
  }, [state.scenario, dispatchScenarioUpdate]);

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
      dispatch({ type: actions.REQUEST_SCENARIO });
      getScenariosByStateName(state.sharedScenarios, state.stateName).then(
        (scenarios) => {
          dispatch({
            type: actions.RECEIVE_SCENARIO,
            payload: scenarios[0] || null,
          });
        },
      );
    }
  }, [state.stateName, state.sharedScenarios]);

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
