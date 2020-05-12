import { Facility } from "../page-multi-facility/types";
import { FacilitiesState } from "./FacilitiesContext";
import * as actions from "./actions";

export function facilitiesReducer(state: FacilitiesState, action: actions.FacilitiesActions): FacilitiesState {
  switch (action.type) {
    case actions.REQUEST_FACILITIES:
      return Object.assign({}, state, { loading: true });
    case actions.RECEIVE_FACILITIES:
      return Object.assign({}, state, {
        loading: false,
        facilities: action.payload
      });
    case actions.RECEIVE_FACILITIES_ERROR:
      return Object.assign({}, state, {
        loading: false,
        failed: true,
        facilities: {}
      });
    case actions.UPDATE_FACILITY: {
      if (!action.payload?.id) return state
      let facilities = { ...state.facilities }
      facilities[action.payload.id] = action.payload as Facility
      return Object.assign({}, state, { facilities });
    }
    case actions.REMOVE_FACILITY: {
      if (!action.payload?.id || !Object.keys(state.facilities).length) return state
      let facilities = { ...state.facilities }
      delete facilities[action.payload.id]
      return Object.assign({}, state, { facilities })
    }
    case actions.RECEIVE_RT_DATA:
      return Object.assign({}, state, action.payload);
    default:
      return state
  }
}
