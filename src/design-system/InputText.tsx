import React from "react";
import styled from "styled-components";

import { InputBaseProps, StyledInput, useInputValue } from "./Input";
import InputLabelAndHelp from "./InputLabelAndHelp";

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
        <StyledInput
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
