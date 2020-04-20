import React, { useEffect, useRef } from "react";
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
  headerStyle?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  focus?: boolean;
}

const InputText: React.FC<Props> = (props) => {
  let inputValue = useInputValue(props);

  const nameInput = useRef() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    if (!props.focus) return;

    nameInput.current.focus();
  }, []);

  return (
    <TextInputContainer>
      <InputLabelAndHelp label={props.labelAbove} labelHelp={props.labelHelp} />
      <VDiv>
        <StyledInput
          type={props.type}
          ref={nameInput}
          value={inputValue ?? ""}
          headerStyle={!!props.headerStyle}
          placeholder={props.valuePlaceholder ?? props.labelPlaceholder}
          onChange={(e) => props.onValueChange(e.target.value)}
          onBlur={props.onBlur}
          onKeyDown={props.onKeyDown}
        />
        {props.children}
      </VDiv>
    </TextInputContainer>
  );
};

export default InputText;
