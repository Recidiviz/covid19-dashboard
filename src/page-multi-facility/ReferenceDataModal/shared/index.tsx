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

export * from "./ReferenceFacilityList";
export * from "./ReferenceFacilitySelect";
