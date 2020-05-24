import React from "react";
import styled from "styled-components";

import InputLabelAndHelp from "../components/design-system/InputLabelAndHelp";
import InputToggle from "../components/design-system/InputToggle";

interface Props {
  onToggle: () => void;
  toggled?: boolean;
  label?: React.ReactNode;
  labelHelp?: React.ReactNode;
}

const ToggleRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 5px 16px 0;
`;

const ToggleRow: React.FC<Props> = (props) => {
  const { toggled, label, labelHelp, onToggle } = props;
  if (!label && !labelHelp) {
    return null;
  }

  return (
    <ToggleRowContainer>
      <InputLabelAndHelp softened {...props} />
      <InputToggle toggled={toggled} onChange={onToggle} />
    </ToggleRowContainer>
  );
};

export default ToggleRow;
