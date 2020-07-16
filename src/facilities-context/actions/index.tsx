import { Facility, RtDataMapping } from "../../page-multi-facility/types";
import {
  FacilityMapping,
  ReferenceFacilityMapping,
} from "../FacilitiesContext";
import {
  CLEAR_FACILITIES,
  CREATE_OR_UPDATE_FACILITY,
  DESELECT_FACILITY,
  RECEIVE_FACILITIES,
  RECEIVE_FACILITIES_ERROR,
  REMOVE_FACILITY,
  REQUEST_FACILITIES,
  SELECT_FACILITY,
} from "./facilities";
import {
  CLEAR_REFERENCE_FACILITIES,
  RECEIVE_REFERENCE_FACILITIES,
} from "./referenceFacilities";
import {
  RECEIVE_RT_DATA_ERROR,
  REQUEST_RT_DATA,
  UPDATE_FACILITY_RT_DATA,
} from "./rtData";
export * from "./rtData";
export * from "./facilities";
export * from "./referenceFacilities";

export type FacilitiesActions =
  | FACILITY_ACTION
  | FACILITY_ID_ACTION
  | RECEIVE_FACILITIES_ACTION
  | RT_DATA_ACTION
  | REQUEST_ACTIONS
  | ERROR_ACTIONS
  | RECEIVE_REFERENCE_FACILITIES_ACTION
  | CLEAR_ACTIONS
  | DESELECT_FACILITY_ACTION;

export type FACILITY_ACTION = {
  type: typeof CREATE_OR_UPDATE_FACILITY;
  payload: Facility;
};

export type RECEIVE_FACILITIES_ACTION = {
  type: typeof RECEIVE_FACILITIES;
  payload: FacilityMapping;
};

export type RT_DATA_ACTION = {
  type: typeof UPDATE_FACILITY_RT_DATA;
  payload: RtDataMapping;
};

export type FACILITY_ID_ACTION = {
  type: typeof SELECT_FACILITY | typeof REMOVE_FACILITY;
  payload: Facility["id"];
};

export type ERROR_ACTIONS = {
  type: typeof RECEIVE_FACILITIES_ERROR | typeof RECEIVE_RT_DATA_ERROR;
};

export type REQUEST_ACTIONS = {
  type: typeof REQUEST_FACILITIES | typeof REQUEST_RT_DATA;
};

export type DESELECT_FACILITY_ACTION = {
  type: typeof DESELECT_FACILITY;
};

export type RECEIVE_REFERENCE_FACILITIES_ACTION = {
  type: typeof RECEIVE_REFERENCE_FACILITIES;
  payload: ReferenceFacilityMapping;
};

export type CLEAR_ACTIONS = {
  type: typeof CLEAR_REFERENCE_FACILITIES | typeof CLEAR_FACILITIES;
};
