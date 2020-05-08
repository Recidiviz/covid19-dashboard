import React from "react";
import styled from "styled-components";

import Colors from "./Colors";
import Tooltip from "./Tooltip";

const HelpButton = styled.span`
  background: ${Colors.darkTeal};
  color: white;
  border-radius: 11px;
  line-height: 9px;
  width: 12px;
  height: 12px;
  display: inline-block;
  text-align: center;
  font-size: 9px;
  padding: 2px;
`;

interface Props {
  children: React.ReactNode;
  placement:
    | "auto"
    | "auto-start"
    | "auto-end"
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "right"
    | "right-start"
    | "right-end"
    | "left"
    | "left-start"
    | "left-end";
}

const HelpButtonWithTooltip: React.FC<Props> = (props) => {
  return (
    <Tooltip content={props.children} placement={props.placement}>
      <HelpButton>?</HelpButton>
    </Tooltip>
  );
};

export default HelpButtonWithTooltip;
