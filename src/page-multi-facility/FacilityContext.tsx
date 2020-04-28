import React from "react";

import { RtData } from "../infection-model/rt";
import { Facility } from "./types";

export type RtDataMapping = {
  [key in Facility["id"]]: RtData;
};

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
    type: "add";
    payload: RtDataMapping;
  },
): RtDataMapping => {
  switch (action.type) {
    case "add":
      return { ...state, ...action.payload };
  }
};
