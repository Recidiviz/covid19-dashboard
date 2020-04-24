import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import FacilityInformation from "../impact-dashboard/FacilityInformation";

const borderStyle = `1px solid ${Colors.paleGreen}`;

const FacilityInformationDiv = styled.div`
  border-top: ${borderStyle};
`;
const SectionHeader = styled.header`
  font-family: Libre Baskerville;
  font-weight: normal;
  font-size: 19px;
  line-height: 24px;
  padding: 20px 0;
  color: ${Colors.forest};
  letter-spacing: -0.06em;
`;

const FacilityInformationSection: React.FC = () => {
  return (
    <FacilityInformationDiv>
      <SectionHeader>Facility Details</SectionHeader>
      <FacilityInformation />
    </FacilityInformationDiv>
  );
};

export default FacilityInformationSection;
