import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputLabelAndHelp from "../design-system/InputLabelAndHelp";
import InputToggle from "../design-system/InputToggle";

interface Props {
  label?: React.ReactNode;
  labelHelp?: React.ReactNode;
}

const borderStyle = `1px solid ${Colors.paleGreen}`;

const ToggleRowContainer = styled.div`
  display: flex;
  border-bottom: ${borderStyle};
  justify-content: space-between;
  padding: 10px 5px 10px 0;
`;

const ToggleRow: React.FC<Props> = (props) => {
  const [toggled, setToggled] = useState(false);
  if (!props.label && !props.labelHelp) {
    return null;
  }

  return (
    <ToggleRowContainer>
      <InputLabelAndHelp softened {...props} />
      <InputToggle toggled={toggled} onChange={() => setToggled(!toggled)} />
    </ToggleRowContainer>
  );
};

export default ToggleRow;
