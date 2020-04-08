import styled from "styled-components";

import Colors from "./Colors";
import Tooltip from "./Tooltip";

const HelpButton = styled.span`
  background: ${Colors.forest};
  color: white;
  border-radius: 14px;
  line-height: 12px;
  width: 16px;
  display: inline-block;
  text-align: center;
  font-size: 9px;

  padding: 2px;
`;

const HelpButtonWithTooltip: React.FC = (props) => {
  return (
    <Tooltip content={props.children}>
      <HelpButton>?</HelpButton>;
    </Tooltip>
  );
};

export default HelpButtonWithTooltip;
