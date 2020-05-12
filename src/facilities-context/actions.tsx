import {
  FacilitiesDispatch,
  FacilitiesState,
  FacilityMapping
} from "./FacilitiesContext";
import { Facility, Facilities } from "../page-multi-facility/types";
import { getFacilities, deleteFacility, saveFacility } from "../database";

export type FacilitiesActions = {
  type: FacilitiesActionTypes,
  payload?: Partial<Facility> & Partial<FacilitiesState> | null
}

export type FacilitiesActionTypes =
  "UPDATE_FACILITY" |
  "REMOVE_FACILITY" |
  "RECEIVE_RT_DATA" |
  "RECEIVE_FACILITIES" |
  "REQUEST_FACILITIES" |
  "RECEIVE_FACILITIES_ERROR"

export const REQUEST_FACILITIES = "REQUEST_FACILITIES";
export const RECEIVE_FACILITIES = "RECEIVE_FACILITIES";
export const RECEIVE_FACILITIES_ERROR = "RECEIVE_FACILITIES_ERROR";
export const UPDATE_FACILITY = "UPDATE_FACILITY";
export const REMOVE_FACILITY = "REMOVE_FACILITY";
export const RECEIVE_RT_DATA = "RECEIVE_RT_DATA";

export async function fetchFacilities(scenarioId: string, dispatch: FacilitiesDispatch) {
  dispatch({ type: REQUEST_FACILITIES })
  try {
    const facilitiesList: Facilities | null = await getFacilities(scenarioId);
    const facilities: FacilityMapping = {};
    if (facilitiesList) {
      facilitiesList.forEach(facility => {
        facilities[facility.id] = facility
      });

      dispatch({
        type: RECEIVE_FACILITIES,
        payload: { ...facilities },
      })
    }
  } catch (error) {
    // note: should save error message in the state.
    // currently getFacilities returns null if there is an error
    dispatch({
      type: RECEIVE_FACILITIES_ERROR,
    })
  }
}

export function updateFacility(dispatch: FacilitiesDispatch) {
  return async (scenarioId: string, facility: Partial<Facility>) => {
    if (facility.id) {
      try {
        const updatedFacility = await saveFacility(scenarioId, facility)
        dispatch({
          type: UPDATE_FACILITY,
          payload: { ...updatedFacility }
        })
      } catch (error) {
        // handle updating facility errors
      }
    }
  }
}

export function removeFacility(dispatch: FacilitiesDispatch) {
  return async (scenarioId: string, facilityId: string) => {
    if (scenarioId && facilityId) {
      try {
        await deleteFacility(scenarioId, facilityId)
        dispatch({
          type: REMOVE_FACILITY,
          payload: { id: facilityId }
        })
      } catch (error) {
        // handle deleting facility errors
      }
    }
  }
}
