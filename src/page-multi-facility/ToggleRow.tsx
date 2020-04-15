import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import HelpButtonWithTooltip from "../design-system/HelpButtonWithTooltip";
import InputToggle from "../design-system/InputToggle";

interface Props {
  text?: React.ReactNode;
  textHelp?: React.ReactNode;
}

const borderStyle = `1px solid ${Colors.paleGreen}`;

const ToggleRowContainer = styled.div`
  display: flex;
  border-bottom: ${borderStyle};
  justify-content: space-between;
  width: 200px;
  padding: 10px 5px 10px 0;
`;

const TextContainer = styled.div``;

const Text = styled.span`
  color: ${Colors.forest};
  font-family: "Rubik", sans-serif;
  font-size: 14px;
  font-weight: 100;
  padding-right: 5px;
`;

const ToggleRow: React.FC<Props> = (props) => {
  const [toggled, setToggled] = useState(false);
  if (!props.text && !props.textHelp) {
    return null;
  }

  return (
    <ToggleRowContainer>
      <TextContainer>
        <Text>{props.text}</Text>
        {props.textHelp && (
          <HelpButtonWithTooltip softened>{props.textHelp}</HelpButtonWithTooltip>
        )}
      </TextContainer>
      <InputToggle toggled={toggled} onChange={() => setToggled(!toggled)} />
    </ToggleRowContainer>
  );
};

export default ToggleRow;
