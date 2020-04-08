import styled from "styled-components";

import Colors from "./Colors";

const HelpButton = styled.span`
  background: ${Colors.forest};
  color: white;
  border-radius: 1em;
  line-height: 12px;
  width: 12px;
  display: inline-block;
  text-align: center;
  font-size: 9px;
`;

const HelpButtonWithTooltip: React.FC = () => {
  return <HelpButton>?</HelpButton>;
};

export default HelpButtonWithTooltip;
