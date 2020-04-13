import React from "react";
import styled from "styled-components";

import { StyledInput } from "./Input";
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

const StyledSelect = styled(StyledInput)`
  -webkit-appearance: none;
  -moz-appearance: none;
`;

const InputSelect: React.FC<Props> = (props) => {
  return (
    <SelectContainer>
      <TextLabel>{props.label}</TextLabel>
      <StyledSelect
        as="select"
        disabled={props.disabled}
        onChange={props.onChange}
        value={props.value}
        name={props.label}
      >
        {props.children}
      </StyledSelect>
    </SelectContainer>
  );
};

export default InputSelect;
