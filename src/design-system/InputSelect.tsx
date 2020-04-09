import React from "react";
import styled from "styled-components";

import TextLabel from "./TextLabel";

interface Props {
  value?: string;
  children: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectContainer = styled.div`
  position: relative;
  font-family: "Poppins", sans-serif;
  flex-grow: 1;
  flex-basis: 50%;
  margin-right: 8px;
`;

const SelectInput = styled.select`
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  border: none;
  padding: 18px;
  background: #e0e4e4;
  outline: 0 solid transparent;
  margin-top: 8px;
  border-radius: 2px;
  font-size: 16px;
  color: #00413e;
`;

const InputSelect: React.FC<Props> = (props) => {
  return (
    <SelectContainer>
      <TextLabel>{props.label}</TextLabel>
      <SelectInput
        disabled={props.disabled}
        onChange={props.onChange}
        value={props.value}
        name={props.label}
      >
        {props.children}
      </SelectInput>
    </SelectContainer>
  );
};

export default InputSelect;
