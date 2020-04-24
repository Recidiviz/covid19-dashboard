import React from "react";
import styled from "styled-components";

import Colors from "./Colors";
import Tooltip from "./Tooltip";

const HelpButton = styled.span<{ softened?: boolean }>`
  background: ${(props) =>
    props.softened ? `${Colors.darkTeal};` : `${Colors.forest};`}
  color: white;
  border-radius: ${(props) => (props.softened ? "11px;" : "14px;")}
  line-height: ${(props) => (props.softened ? "10px;" : "12px;")}
  width: ${(props) => (props.softened ? "12px;" : "16px;")}
  height: ${(props) => (props.softened ? "12px;" : "16px;")}
  display: inline-block;
  text-align: center;
  font-size: ${(props) => (props.softened ? "9px;" : "9px;")}
  align-self: center;
  padding: 2px;
`;

interface Props {
  children: React.ReactNode;
  softened?: boolean;
}

const HelpButtonWithTooltip: React.FC<Props> = (props) => {
  return (
    <Tooltip content={props.children}>
      <HelpButton softened={props.softened}>?</HelpButton>
    </Tooltip>
  );
};

export default HelpButtonWithTooltip;
