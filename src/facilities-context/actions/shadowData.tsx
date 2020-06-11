import { getShadowFacilities } from "../../database";
import {
  FacilitiesDispatch,
  ShadowFacilityMapping,
} from "../FacilitiesContext";

export const RECEIVE_SHADOW_FACILITIES = "RECEIVE_SHADOW_FACILITIES";

export async function fetchShadowFacilities(
  state: string,
  systemType: string,
  dispatch: FacilitiesDispatch,
) {
  const facilities = await getShadowFacilities({ state, systemType });
  const payload: ShadowFacilityMapping = {};
  facilities.forEach((f) => {
    payload[f.id] = f;
  });
  dispatch({ type: RECEIVE_SHADOW_FACILITIES, payload });
}
