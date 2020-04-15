import styled from "styled-components";

import Colors from "./Colors";
import Tooltip from "./Tooltip";

const HelpButton = styled.span<{ muted?: boolean }>`
  background: ${(props) =>
    props.muted ? `${Colors.darkTeal};` : `${Colors.forest};`}
  color: white;
  border-radius: ${(props) => (props.muted ? "11px;" : "14px;")}
  line-height: ${(props) => (props.muted ? "10px;" : "12px;")}
  width: ${(props) => (props.muted ? "12px;" : "16px;")}
  height: ${(props) => (props.muted ? "12px;" : "16px;")}
  display: inline-block;
  text-align: center;
  font-size: ${(props) => (props.muted ? "9px;" : "9px;")}
  align-self: center;
  padding: 2px;
`;

interface Props {
  children: React.ReactNode;
  muted?: boolean;
}

const HelpButtonWithTooltip: React.FC<Props> = (props) => {
  return (
    <Tooltip content={props.children}>
      <HelpButton muted={props.muted}>?</HelpButton>
    </Tooltip>
  );
};

export default HelpButtonWithTooltip;
