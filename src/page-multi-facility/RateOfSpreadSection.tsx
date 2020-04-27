import { cloneDeep } from "lodash";
import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import MitigationInformation from "../impact-dashboard/MitigationInformation";

const borderStyle = `1px solid ${Colors.paleGreen}`;

const RateOfSpreadDiv = styled.div`
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

const RateOfSpreadSection: React.FC = () => {
  return (
    <RateOfSpreadDiv>
      <SectionHeader>Rate of Spread</SectionHeader>
      <MitigationInformation />
    </RateOfSpreadDiv>
  );
};

export default RateOfSpreadSection;
