import styled from "styled-components";

import Colors from "../../../design-system/Colors";
import { Facility, ReferenceFacility } from "../../types";

export type ReferenceFacilitySelections = {
  [id in ReferenceFacility["id"]]: Facility["id"];
};

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TitleText = styled.h1`
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  color: ${Colors.forest};
  font-family: "Libre Franklin";
`;

export const SubheadingContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;
export const SubheadingText = styled.h2`
  font-weight: 600;
  line-height: 10px;
  font-size: 10px;
  font-family: "Poppins";
  flex: 1 1;
`;

export * from "./ReferenceFacilityList";
export * from "./ReferenceFacilitySelect";
export * from "./utils";
