import React from "react";
import styled from "styled-components";

import Colors from "./Colors";
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

const caretSize = 5;
const SelectWrapper = styled.div`
  position: relative;

  &::after {
    border-left: ${caretSize}px solid transparent;
    border-right: ${caretSize}px solid transparent;
    border-top: ${caretSize}px solid ${Colors.forest};
    content: "";
    display: inline-block;
    height: 0;
    pointer-events: none;
    position: absolute;
    right: 8px;
    top: calc(50% + ${caretSize / 2}px);
    width: 0;
  }
`;

const StyledSelect = styled(StyledInput)`
  appearance: none;
  padding-right: ${caretSize * 2 + 16}px;
  text-overflow: ellipsis;
`;

const InputSelect: React.FC<Props> = (props) => {
  return (
    <SelectContainer>
      {props.label && <TextLabel>{props.label}</TextLabel>}
      <SelectWrapper>
        <StyledSelect
          as="select"
          disabled={props.disabled}
          onChange={props.onChange}
          value={props.value}
          name={props.label}
        >
          {props.children}
        </StyledSelect>
      </SelectWrapper>
    </SelectContainer>
  );
};

export default InputSelect;
