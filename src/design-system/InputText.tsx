import React, { useEffect, useRef } from "react";
import styled from "styled-components";

import Colors from "./Colors";
import { CustomDebounceInput, InputBaseProps, InputStyle } from "./Input";
import InputLabelAndHelp from "./InputLabelAndHelp";

/**
 * How long after the last keystroke should we make updates based off the input?
 */
const InputTextTimeoutMs = 1000;

const TextInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InputWrapper = styled.div`
  ${InputStyle}

  align-items: center;
  display: flex;
  flex-direction: row;

  &.relativeAmountError--active {
    background-color: ${Colors.darkRed10};
  }
`;

const WrappedInput = styled(CustomDebounceInput)`
  ${InputStyle}
  margin: 0;
  padding: 0;

  /*
    This is a little weird but we need a fixed number to override
    default sizing. Element will still flex as needed.
  */
  width: 0;
  color: ${Colors.green};
  &.relativeAmountError--active {
    background-color: transparent;
  }
`;

const WrappedInput = styled(CustomDebounceInput)`
  ${InputStyle}
  margin: 0;
  padding: 0;

  /*
    This is a little weird but we need a fixed number to override
    default sizing. Element will still flex as needed.
  */
  width: 0;
  color: ${Colors.green};
`;

interface Props extends InputBaseProps<string> {
  type: "text" | "number" | "email";
  headerStyle?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  focus?: boolean;
  maxLength?: number;
  required?: boolean;
  style?: object;
  inputRelativityError?: boolean;
}

const InputText: React.FC<Props> = (props) => {
  const nameInput = useRef() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    if (!props.focus) return;

    nameInput.current.focus();
  }, []);

  return (
    <TextInputContainer>
      <InputLabelAndHelp label={props.labelAbove} labelHelp={props.labelHelp} />
      <InputWrapper
        style={props.style}
        className={
          props.inputRelativityError ? "relativeAmountError--active" : ""
        }
      >
        <WrappedInput
          type={props.type}
          inputRef={nameInput}
          value={props.valueEntered ?? ""}
          placeholder={props.labelPlaceholder}
          maxLength={props.maxLength}
          required={props.required}
          onChange={(e) => props.onValueChange(e.target.value)}
          onBlur={props.onBlur}
          onKeyDown={props.onKeyDown}
          debounceTimeout={InputTextTimeoutMs}
          className={
            props.inputRelativityError ? "relativeAmountError--active" : ""
          }
        />
        {props.children}
      </InputWrapper>
    </TextInputContainer>
  );
};

export default InputText;
