import React, { useEffect, useRef } from "react";
import styled from "styled-components";

import { InputBaseProps, StyledInput, useInputValue } from "./Input";
import InputLabelAndHelp from "./InputLabelAndHelp";

const TextInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputWrapper = styled(StyledInput)`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const WrappedInput = styled(StyledInput)`
  margin: 0;
  padding: 0;
  /*
    This is a little weird but we need a fixed number to override
    default sizing. Element will still flex as needed.
  */
  width: 0;
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
      <InputWrapper as="div">
        <WrappedInput
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
      </InputWrapper>
    </TextInputContainer>
  );
};

export default InputText;
