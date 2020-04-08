import React from "react";
import styled from "styled-components";

import TextLabel from "./TextLabel";

const Input = styled.input`
  padding: 16px;
  background: #e0e4e4;
  outline: 0 solid transparent;
  box-shadow: none;
  border: none;
  font-size: 16px;
  border-radius: 2px;
  font-family: "Rubik", sans-serif;
  color: #00413e;
  margin-top: 8px;
`;

const TextInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

interface Props {
  type?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string;
}

const InputTextOld: React.FC<Props> = (props) => {
  return (
    <TextInputContainer>
      {props.label ?? <TextLabel>{props.label}</TextLabel>}
      <Input
        type={props.type || "text"}
        defaultValue={props.defaultValue}
        value={props.value}
        placeholder={props.placeholder}
        onChange={props.onChange}
        name={props.label}
      />
      {props.children}
    </TextInputContainer>
  );
};

export default InputTextOld;
