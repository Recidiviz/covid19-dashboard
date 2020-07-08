import { Scenario } from "../../page-multi-facility/types";
export const REQUEST_SHARED_SCENARIOS = "REQUEST_SHARED_SCENARIOS";
export const RECEIVE_SHARED_SCENARIOS = "RECEIVE_SHARED_SCENARIOS";
export const REQUEST_SCENARIO = "REQUEST_SCENARIO";
export const RECEIVE_SCENARIO = "RECEIVE_SCENARIO";
export const UPDATE_STATE_NAME = "UPDATE_STATE_NAME";

export type WeeklyReportActions =
  | SharedScenariosAction
  | RequestActions
  | ScenarioAction
  | StateNameAction

export type SharedScenariosAction = {
  type: typeof RECEIVE_SHARED_SCENARIOS;
  payload: Scenario[];
};

export type ScenarioAction = {
  type: typeof RECEIVE_SCENARIO;
  payload: Scenario | null;
};


export type StateNameAction = {
  type: typeof UPDATE_STATE_NAME;
  payload: string;
};

export type RequestActions = {
  type: typeof REQUEST_SHARED_SCENARIOS | typeof REQUEST_SCENARIO;
};
