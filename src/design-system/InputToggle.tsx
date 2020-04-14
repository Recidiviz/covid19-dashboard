import React from "react";
import styled from "styled-components";

import Colors from "./Colors";

interface Props {
  toggled?: boolean;
  onChange: (e: React.ChangeEvent) => void;
}

const ToggleContainer = styled.div`
  display: flex;
  flex-direction: row nowrap;
`;

const Label = styled.label<{ toggled?: boolean }>`
  align-self: center;
  color: ${(props) => (props.toggled ? Colors.teal : Colors.darkTeal)};
  font-size: 14px;
  font-family: "Poppins", sans-serif;
  min-width: 50px;
  padding: 0 1em;
`;

const ToggleInput = styled.input`
  height: 0;
  visibility: hidden;
  width: 0;
`;

const ToggleButtonContainer = styled.label<{ toggled?: boolean }>`
  align-items: center;
  background: ${(props) => (props.toggled ? Colors.teal : Colors.darkTeal)};
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  height: 26px;
  justify-content: space-between;
  position: relative;
  transition: background-color 0.2s;
  width: 48px;
`;

const ToggleButton = styled.span<{ toggled?: boolean }>`
  background: ${Colors.slate};
  border-radius: 50%;
  content: "";
  cursor: pointer;
  height: 15px;
  left: ${(props) => (props.toggled ? "calc(100% - 5px)" : "5px")};
  position: absolute;
  top: 5px;
  transition: 0.2s;
  ${(props) => (props.toggled ? `transform: translateX(-100%);` : null)}
  width: 15px
`;

const InputToggle: React.FC<Props> = (props) => {
  const { toggled, onChange } = props;
  const label = toggled ? "On" : "Off";

  return (
    <ToggleContainer>
      <Label toggled={toggled} htmlFor="InputToggle">
        {label}
      </Label>
      <ToggleInput
        id="ToggleInput"
        type="checkbox"
        checked={toggled}
        onChange={onChange}
      />
      <ToggleButtonContainer htmlFor="ToggleInput" toggled={toggled}>
        <ToggleButton toggled={toggled} />
      </ToggleButtonContainer>
    </ToggleContainer>
  );
};

export default InputToggle;
