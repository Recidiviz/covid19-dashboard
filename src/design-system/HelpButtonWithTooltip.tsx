import React from "react";
import styled from "styled-components";

import questionMark from "./icons/ic_questionMark.svg";
import Tooltip from "./Tooltip";

const HelpButton = styled.img`
  display: inline-block;
  padding: 2px;
`;

interface Props {
  children: React.ReactNode;
}

const HelpButtonWithTooltip: React.FC<Props> = (props) => {
  return (
    <Tooltip content={props.children}>
      <HelpButton src={questionMark} alt="help tooltip trigger" />
    </Tooltip>
  );
};

export default HelpButtonWithTooltip;
