import * as actions from "./actions";
import { FacilitiesState } from "./FacilitiesContext";

export function facilitiesReducer(
  state: FacilitiesState,
  action: actions.FacilitiesActions,
): FacilitiesState {
  switch (action.type) {
    case actions.REQUEST_FACILITIES:
      return Object.assign({}, state, { loading: true });

    case actions.RECEIVE_FACILITIES:
      return Object.assign({}, state, {
        loading: false,
        failed: false,
        facilities: action.payload,
      });

    case actions.RECEIVE_FACILITIES_ERROR:
      return Object.assign({}, state, {
        loading: false,
        failed: true,
        facilities: {},
      });

    case actions.CREATE_OR_UPDATE_FACILITY: {
      const facility = action.payload;
      let facilities = { ...state.facilities };
      facilities[facility.id] = facility;
      return Object.assign({}, state, { facilities });
    }

    case actions.REMOVE_FACILITY: {
      const facilityId = action.payload;
      let facilities = { ...state.facilities };
      let rtData = { ...state.rtData };
      // remove facility from facilities & rtData
      delete facilities[facilityId];
      delete rtData[facilityId];
      return Object.assign({}, state, {
        facilities,
        rtData,
        selectedFacility: null,
      });
    }

    case actions.UPDATE_FACILITY_RT_DATA:
      return Object.assign({}, state, {
        rtData: { ...state.rtData, ...action.payload },
      });

    case actions.SELECT_FACILITY:
      const selectedFacilityId = action.payload;
      return Object.assign({}, state, { selectedFacilityId });

    case actions.DESELECT_FACILITY:
      return Object.assign({}, state, { selectedFacilityId: null });

    case actions.RECEIVE_SHADOW_FACILITIES:
      return { ...state, shadowFacilities: action.payload };

    default:
      return state;
  }
}
