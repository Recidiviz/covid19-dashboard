import { mapValues } from "lodash";

import { getReferenceFacilities } from "../../database";
import {
  Facility,
  FacilityReferenceMapping,
} from "../../page-multi-facility/types";
import {
  FacilitiesDispatch,
  FacilityMapping,
  ReferenceFacilityMapping,
} from "../FacilitiesContext";
import { mergeFacilityObjects } from "../transforms";

export const RECEIVE_REFERENCE_FACILITIES = "RECEIVE_REFERENCE_FACILITIES";
export const CLEAR_REFERENCE_FACILITIES = "CLEAR_REFERENCE_FACILITIES";

export async function fetchReferenceFacilities(
  stateName: string,
  systemType: string,
  dispatch: FacilitiesDispatch,
) {
  const facilities = await getReferenceFacilities({ stateName, systemType });
  const payload: ReferenceFacilityMapping = {};
  facilities.forEach((f) => {
    payload[f.id] = f;
  });
  dispatch({ type: RECEIVE_REFERENCE_FACILITIES, payload });
  return payload;
}

export function clearReferenceFacilities(dispatch: FacilitiesDispatch) {
  dispatch({ type: CLEAR_REFERENCE_FACILITIES });
}

function mapReferenceFacilities(
  referenceFacilities: ReferenceFacilityMapping,
  facilityToReference: FacilityReferenceMapping,
) {
  // this will map facility IDs to their corresponding reference facility objects,
  // per the user's configuration on the scenario object
  return mapValues(
    facilityToReference,
    (referenceFacilityId) => referenceFacilities[referenceFacilityId],
  );
}

export function buildCompositeFacilities(
  facilities: FacilityMapping,
  referenceFacilities: ReferenceFacilityMapping,
  facilityToReference: FacilityReferenceMapping | undefined,
) {
  if (facilityToReference) {
    const mappedReferenceFacilities = mapReferenceFacilities(
      referenceFacilities,
      facilityToReference,
    );

    // this will make composite facilities or pass through user data as needed
    return mapValues(facilities, (facility) =>
      mergeFacilityObjects({
        userFacility: facility,
        referenceFacility: mappedReferenceFacilities[facility.id],
      }),
    );
  }

  return facilities;
}

export function buildCompositeFacility(
  facility: Facility,
  referenceFacilities: ReferenceFacilityMapping,
  facilityToReference: FacilityReferenceMapping | undefined,
) {
  if (facilityToReference) {
    const mappedReferenceFacilities = mapReferenceFacilities(
      referenceFacilities,
      facilityToReference,
    );

    // this will make composite facilities or pass through user data as needed
    return mergeFacilityObjects({
      userFacility: facility,
      referenceFacility: mappedReferenceFacilities[facility.id],
    });
  }

  return facility;
}
