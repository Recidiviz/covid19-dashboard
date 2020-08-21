import { mapValues } from "lodash";

import { getReferenceFacilities } from "../../database";
import {
  Facility,
  FacilityReferenceMapping,
  ReferenceFacility,
  Scenario,
} from "../../page-multi-facility/types";
import { FacilitiesDispatch } from "../FacilitiesContext";
import { mergeFacilityObjects } from "../transforms";
import { FacilityMapping, ReferenceFacilityMapping } from "../types";
import { createOrUpdateFacility } from "./facilities";

export const RECEIVE_REFERENCE_FACILITIES = "RECEIVE_REFERENCE_FACILITIES";
export const CLEAR_REFERENCE_FACILITIES = "CLEAR_REFERENCE_FACILITIES";
export const CAN_USE_REFERENCE_DATA = "CAN_USE_REFERENCE_DATA";
export const REFERENCE_DATA_FEATURE_AVAILABLE =
  "REFERENCE_DATA_FEATURE_AVAILABLE";

export async function fetchReferenceFacilities(
  stateName: string,
  systemType: string,
) {
  const facilities = await getReferenceFacilities({ stateName, systemType });
  const payload: ReferenceFacilityMapping = {};
  facilities.forEach((f) => {
    payload[f.id] = f;
  });
  return payload;
}

export function clearReferenceFacilities(dispatch: FacilitiesDispatch) {
  dispatch({ type: CLEAR_REFERENCE_FACILITIES });
}

export function receiveReferenceFacilities(
  dispatch: FacilitiesDispatch,
  referenceFacilities: ReferenceFacilityMapping,
) {
  dispatch({
    type: RECEIVE_REFERENCE_FACILITIES,
    payload: referenceFacilities,
  });
}

export function setCanUseReferenceData(
  dispatch: FacilitiesDispatch,
  payload: boolean,
) {
  dispatch({ type: CAN_USE_REFERENCE_DATA, payload });
}

export function setReferenceDataFeatureAvailable(
  dispatch: FacilitiesDispatch,
  payload: boolean,
) {
  dispatch({ type: REFERENCE_DATA_FEATURE_AVAILABLE, payload });
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

export async function createUserFacilitiesFromReferences(
  scenarioId: Scenario["id"],
  selectedFacilities: ReferenceFacility[],
  referenceFacilities: ReferenceFacilityMapping,
) {
  const facilitySaves = selectedFacilities.map((facility) => {
    const minimalModelInput = {
      observedAt: new Date(),
      updatedAt: new Date(),
      stateName: facility.stateName,
      countyName: facility.countyName,
    };

    return createOrUpdateFacility(scenarioId, {
      name: facility.canonicalName,
      systemType: facility.facilityType,
      modelInputs: minimalModelInput,
      modelVersions: [minimalModelInput],
    });
  });

  const savedFacilities = await Promise.all(facilitySaves);

  // If for whatever reason the number of facilities saved does not match the
  // number of facilities that were originally selected then return immediately
  // so that we don't mis-match User Facilities with Reference Facilities.  See
  // the comment below about how we use insertion order and indexing to map User
  // Facilities to Reference Facilities.
  if (savedFacilities.length !== selectedFacilities.length) {
    console.error(`The number of saved facilities (${savedFacilities.length}) does not match \
      the number of selected facilities (${selectedFacilities.length}). The saved User \
      Facilities will not be mapped to selected Reference Facilities.`);
    return;
  }

  // Promise.all preserves insertion order so we can use this information to guarantee User
  // Facilities in the savedFacilities array have a matching index with the Reference
  // Facilities in the selectedFacilities array.  Since the indexes match, it is acceptable
  // to generate the facilityIdToReferenceId mapping by iterating over the savedFacilities
  // and mapping corresponding entries at the same index in the selectedFacilities array.
  // See the following StackOverflow entry for an example of Promise.all's return ordering:
  // https://stackoverflow.com/questions/28066429/promise-all-order-of-resolved-values

  const isFacility = (facility: Facility | void): facility is Facility =>
    facility !== null && facility !== undefined;

  const facilities = savedFacilities.filter(isFacility);
  const facilityToReference: FacilityReferenceMapping = {};
  savedFacilities.map((facility, index) => {
    if (!facility) return;
    facilityToReference[facility.id] = selectedFacilities[index].id;
  });
  const compositeFacilities = facilities.map((facility) => {
    return buildCompositeFacility(
      facility,
      referenceFacilities,
      facilityToReference,
    );
  });

  return { compositeFacilities, facilityToReference };
}
