import styled from "styled-components";

import Colors from "./Colors";
import Tooltip from "./Tooltip";

const HelpButton = styled.span<{ muted?: boolean }>`
  background: ${(props) =>
    props.muted ? `${Colors.darkTeal};` : `${Colors.forest};`}
  color: white;
  border-radius: ${(props) => (props.muted ? "9px;" : "14px")}
  line-height: ${(props) => (props.muted ? "7px;" : "12px")}
  width: ${(props) => (props.muted ? "9px;" : "16px")}
  height: ${(props) => (props.muted ? "9px;" : "16px")}
  display: inline-block;
  text-align: center;
  font-size: ${(props) => (props.muted ? "6px;" : "9px")}
  align-self: center;
  padding: 2px;
`;

interface Props {
  muted?: React.ReactNode;
  children: React.ReactNode;
}

const HelpButtonWithTooltip: React.FC = (props) => {
  return (
    <Tooltip content={props.children}>
      <HelpButton muted={props.muted}>?</HelpButton>
    </Tooltip>
  );
};

export default HelpButtonWithTooltip;
