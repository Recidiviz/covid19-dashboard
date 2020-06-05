import {
  Facilities,
  Facility,
  RtDataMapping,
} from "../../page-multi-facility/types";
export * from "./rtData";
export * from "./facilities";

export type FacilitiesActions = {
  type: FacilitiesActionTypes;
  payload?: Partial<Facility> | Facilities | RtDataMapping | null;
};

export type FacilitiesActionTypes =
  | "CREATE_OR_UPDATE_FACILITY"
  | "SELECT_FACILITY"
  | "DESELECT_FACILITY"
  | "UPDATE_FACILITY"
  | "REMOVE_FACILITY"
  | "REQUEST_RT_DATA"
  | "RECEIVE_RT_DATA"
  | "RECEIVE_RT_DATA_ERROR"
  | "RECEIVE_FACILITIES"
  | "REQUEST_FACILITIES"
  | "RECEIVE_FACILITIES_ERROR";
