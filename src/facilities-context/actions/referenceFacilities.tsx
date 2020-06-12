import { getReferenceFacilities } from "../../database";
import {
  FacilitiesDispatch,
  ReferenceFacilityMapping,
} from "../FacilitiesContext";

export const RECEIVE_REFERENCE_FACILITIES = "RECEIVE_REFERENCE_FACILITIES";
export const CLEAR_REFERENCE_FACILITIES = "CLEAR_REFERENCE_FACILITIES";

export async function fetchReferenceFacilities(
  state: string,
  systemType: string,
  dispatch: FacilitiesDispatch,
) {
  const facilities = await getReferenceFacilities({ state, systemType });
  const payload: ReferenceFacilityMapping = {};
  facilities.forEach((f) => {
    payload[f.id] = f;
  });
  dispatch({ type: RECEIVE_REFERENCE_FACILITIES, payload });
}

export async function clearReferenceFacilities(dispatch: FacilitiesDispatch) {
  dispatch({ type: CLEAR_REFERENCE_FACILITIES });
}
