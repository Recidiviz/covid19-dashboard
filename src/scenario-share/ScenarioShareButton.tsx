import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import iconLinkPath from "../design-system/icons/ic_link.svg";

const Button = styled.button`
  color: ${Colors.forest};
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  font-weight: normal;
  letter-spacing: -0.02em;
`;

const IconLink = styled.img`
  display: inline-block;
  height: 10px;
  margin-right: 8px;
  width: 10px;
`;

const ScenarioShareButton: React.FC = () => {
  return (
    <Button>
      <IconLink src={iconLinkPath} />
      Share Scenario
    </Button>
  );
};

export default ScenarioShareButton;
