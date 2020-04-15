import styled from "styled-components";

import Colors from "../design-system/Colors";
import HelpButtonWithTooltip from "../design-system/HelpButtonWithTooltip";

interface Props {
  text?: React.ReactNode;
  textHelp?: React.ReactNode;
}

const borderStyle = `1px solid ${Colors.paleGreen}`;

const ToggleRowContainer = styled.div`
  display: flex;
  border-bottom: ${borderStyle};
  justify-content: flex-start;
  width: 200px;
  padding: 10px 5px 10px 0;
`;

const Text = styled.span`
  color: ${Colors.forest};
  font-family: "Rubik", sans-serif;
  font-size: 12px;
  font-weight: 100;
  padding-right: 5px;
`;

const ToggleRow: React.FC<Props> = (props) => {
  if (!props.text && !props.textHelp) {
    return null;
  }

  return (
    <ToggleRowContainer>
      <Text>{props.text}</Text>
      {props.textHelp && (
        <HelpButtonWithTooltip muted>{props.textHelp}</HelpButtonWithTooltip>
      )}
    </ToggleRowContainer>
  );
};

export default ToggleRow;
