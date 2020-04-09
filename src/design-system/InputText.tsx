import React from "react";
import styled from "styled-components";

import { InputBaseProps, useInputValue } from "./Input";
import InputLabelAndHelp from "./InputLabelAndHelp";

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
  flex: 1 1 auto;
  width: 100%;
`;

const TextInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const VDiv = styled.div`
  display: flex;
  flex-direction: row;
`;

interface Props extends InputBaseProps<string> {
  type: "text" | "number";
}

const InputText: React.FC<Props> = (props) => {
  let inputValue = useInputValue(props);

  return (
    <TextInputContainer>
      <InputLabelAndHelp label={props.labelAbove} labelHelp={props.labelHelp} />
      <VDiv>
        <Input
          type={props.type}
          value={inputValue ?? ""}
          placeholder={props.valuePlaceholder ?? props.labelPlaceholder}
          onChange={(e) => props.onValueChange(e.target.value)}
        />
        {props.children}
      </VDiv>
    </TextInputContainer>
  );
};

export default InputText;
