import {
  FacilitiesDispatch,
  FacilitiesState,
  FacilityMapping
} from "./FacilitiesContext";
import { Facility, Facilities, RtDataMapping } from "../page-multi-facility/types";
import { getRtDataForFacility } from "../infection-model/rt";
import { getFacilities, deleteFacility, saveFacility } from "../database";

export type FacilitiesActions = {
  type: FacilitiesActionTypes,
  payload?: Partial<Facility> | Facilities | RtDataMapping | null
}

export type FacilitiesActionTypes =
  "UPDATE_FACILITY" |
  "REMOVE_FACILITY" |
  "REQUEST_RT_DATA" |
  "RECEIVE_RT_DATA" |
  "RECEIVE_RT_DATA_ERROR" |
  "RECEIVE_FACILITIES" |
  "REQUEST_FACILITIES" |
  "RECEIVE_FACILITIES_ERROR"

export const REQUEST_FACILITIES = "REQUEST_FACILITIES";
export const RECEIVE_FACILITIES = "RECEIVE_FACILITIES";
export const RECEIVE_FACILITIES_ERROR = "RECEIVE_FACILITIES_ERROR";

export const UPDATE_FACILITY = "UPDATE_FACILITY";
export const REMOVE_FACILITY = "REMOVE_FACILITY";

export const REQUEST_RT_DATA = "REQUEST_RT_DATA";
export const RECEIVE_RT_DATA = "RECEIVE_RT_DATA";
export const RECEIVE_RT_DATA_ERROR = "RECEIVE_RT_DATA_ERROR";

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

export async function fetchRtData(state: FacilitiesState, dispatch: FacilitiesDispatch) {
  dispatch({ type: REQUEST_RT_DATA })

  try {
    const { facilities, rtData } = state;
    const rtDataForFacilities: RtDataMapping = {}

    console.log('fetching rt data function: ', facilities, rtData)

    await Promise.all(
      Object.values({ ...facilities }).map(async (facility) => {
        // don't fetch data if we already have it
        if (rtData && rtData.hasOwnProperty(facility.id)) return;

        const facilityRtData = await getRtDataForFacility(facility);
        rtDataForFacilities[facility.id] = facilityRtData
      }),
    );

    dispatch({
      type: RECEIVE_RT_DATA,
      payload: rtDataForFacilities,
    })
  } catch (error) {
    // what to do here if we get an error...should error be per facility rt data
    dispatch({
      type: RECEIVE_RT_DATA_ERROR
    })
  }
}

export function updateFacility(dispatch: FacilitiesDispatch) {
  return async (scenarioId: string, facility: Partial<Facility>) => {
    if (scenarioId && facility.id) {
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
