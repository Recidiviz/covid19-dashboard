import * as actions from "./actions";
import { WeeklyReportState } from "./WeeklyReportContext";

export function weeklyReportReducer(
  state: WeeklyReportState,
  action: actions.WeeklyReportActions,
): WeeklyReportState {
  switch (action.type) {
    case actions.REQUEST_SHARED_SCENARIOS:
      return Object.assign({}, state, { loading: true });
    case actions.RECEIVE_SHARED_SCENARIOS:
      return Object.assign({}, state, {
        loading: false,
        sharedScenarios: action.payload,
      });
    case actions.RECEIVE_SCENARIO:
      return Object.assign({}, state, {
        scenario: action.payload,
      });
    case actions.UPDATE_STATE_NAME:
      return Object.assign({}, state, {
        stateName: action.payload,
      });
    case actions.RECEIVE_FACILITIES:
      return Object.assign({}, state, {
        facilities: action.payload,
      });
    default:
      return state;
  }
}
