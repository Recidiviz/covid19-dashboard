import { getRtDataForFacility } from "../../infection-model/rt";
import { RtDataMapping } from "../../page-multi-facility/types";
import { FacilitiesDispatch, FacilitiesState } from "../FacilitiesContext";

export const REQUEST_RT_DATA = "REQUEST_RT_DATA";
export const RECEIVE_RT_DATA = "RECEIVE_RT_DATA";
export const RECEIVE_RT_DATA_ERROR = "RECEIVE_RT_DATA_ERROR";

export async function fetchRtData(
  state: FacilitiesState,
  dispatch: FacilitiesDispatch,
) {
  dispatch({ type: REQUEST_RT_DATA });

  try {
    const { facilities, rtData } = state;
    const rtDataForFacilities: RtDataMapping = {};

    console.log("fetching rt data function: ", facilities, rtData);

    await Promise.all(
      Object.values({ ...facilities }).map(async (facility) => {
        // don't fetch data if we already have it
        if (rtData && rtData.hasOwnProperty(facility.id)) return;

        const facilityRtData = await getRtDataForFacility(facility);
        rtDataForFacilities[facility.id] = facilityRtData;
      }),
    );

    dispatch({
      type: RECEIVE_RT_DATA,
      payload: rtDataForFacilities,
    });
  } catch (error) {
    // what to do here if we get an error...should error be per facility rt data
    dispatch({
      type: RECEIVE_RT_DATA_ERROR,
    });
  }
}
