import { uniqueId } from "lodash";
import React, { useState } from "react";
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
  font-size: 9px;
  font-family: "Poppins", sans-serif;
  min-width: 50px;
  padding: 0 1em;
  text-align: right;
`;

const ToggleInput = styled.input`
  height: 0;
  visibility: hidden;
  width: 0;
`;

const ToggleButtonContainer = styled.label<{ toggled?: boolean }>`
  align-items: center;
  align-self: flex-end;
  background: ${(props) => (props.toggled ? Colors.teal : Colors.darkTeal)};
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  height: 13px;
  justify-content: space-between;
  position: relative;
  transition: background-color 0.2s;
  width: 20px;
`;

const ToggleButton = styled.span<{ toggled?: boolean }>`
  background: ${Colors.slate};
  align-self: center;
  border-radius: 50%;
  content: "";
  cursor: pointer;
  height: 8px;
  left: ${(props) => (props.toggled ? "calc(100% - 2px)" : "2px")};
  position: absolute;
  top: 2px;
  transition: 0.2s;
  ${(props) => (props.toggled ? `transform: translateX(-100%);` : null)}
  width: 8px
`;

const InputToggle: React.FC<Props> = (props) => {
  const [inputId] = useState(uniqueId("ToggleInput_"));
  const { toggled, onChange } = props;
  const label = toggled ? "On" : "Off";

  return (
    <ToggleContainer>
      <Label toggled={toggled}>{label}</Label>
      <ToggleInput
        id={inputId}
        type="checkbox"
        checked={toggled}
        onChange={onChange}
      />
      <ToggleButtonContainer htmlFor={inputId} toggled={toggled}>
        <ToggleButton toggled={toggled} />
      </ToggleButtonContainer>
    </ToggleContainer>
  );
};

export default InputToggle;
