import React from "react";

import { FacilityEvents } from "../constants/dispatchEvents";
import { Facility, RtDataMapping } from "./types";

interface FacilityContextProps {
  facility?: Facility;
  setFacility: any;
  rtData?: RtDataMapping;
  dispatchRtData: any;
}

export const FacilityContext = React.createContext<FacilityContextProps>({
  setFacility: () => undefined,
  dispatchRtData: () => ({}),
});

export const rtDataReducer = (
  state: RtDataMapping,
  action: {
    type: FacilityEvents;
    payload: any;
  },
): RtDataMapping => {
  switch (action.type) {
    case FacilityEvents.ADD:
      return { ...state, ...action.payload };

    case FacilityEvents.UPDATE:
      const { id, data } = action.payload;
      if (!state[id]) {
        return state;
      }
      const newState = { ...state };
      newState[id] = data;
      return newState;

    default:
      return state;
  }
};
