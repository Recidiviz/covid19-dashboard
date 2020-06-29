import {
  FacilityMapping,
  ReferenceFacilityMapping,
} from "../../../facilities-context";
import { FacilityReferenceMapping } from "../../types";

export function getUnmappedFacilities(
  mappedReferenceFacilities: FacilityReferenceMapping,
  facilitiesMapping: FacilityMapping,
) {
  return Object.values(facilitiesMapping).filter((facility) => {
    return !Object.keys(mappedReferenceFacilities).includes(facility.id);
  });
}

export function getUnmappedReferenceFacilities(
  mappedReferenceFacilities: FacilityReferenceMapping,
  referenceFacilities: ReferenceFacilityMapping,
) {
  return Object.values(referenceFacilities).filter((refFacility) => {
    return !Object.values(mappedReferenceFacilities).includes(refFacility.id);
  });
}
