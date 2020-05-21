import React, { useEffect, useRef } from "react";
import styled from "styled-components";

import Colors from "./Colors";
import { InputBaseProps, StyledInput } from "./Input";
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
  ${StyledInput}

  align-items: center;
  display: flex;
  flex-direction: row;
`;

const WrappedInput = styled(StyledInput)`
  margin: 0;

  /*
    This is a little weird but we need a fixed number to override
    default sizing. Element will still flex as needed.
  */
  width: 0;
  color: ${Colors.green};

  // make placeholder font size smaller than the input's
  &::-webkit-input-placeholder {
    ${(props) => (props.headerStyle ? "font-size: 18px" : "")}
  }
  &::-moz-placeholder {
    ${(props) => (props.headerStyle ? "font-size: 18px" : "")}
  }
  &:-ms-input-placeholder {
    ${(props) => (props.headerStyle ? "font-size: 18px" : "")}
  }
  &:-moz-placeholder {
    ${(props) => (props.headerStyle ? "font-size: 18px" : "")}
  }
`;

interface Props extends InputBaseProps<string> {
  type: "text" | "number";
  headerStyle?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  focus?: boolean;
  placeholder?: string;
  style?: object;
}

const InputText: React.FC<Props> = (props) => {
  const placeholder = props.valuePlaceholder ?? props.labelPlaceholder;
  const nameInput = useRef() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    if (!props.focus) return;

    nameInput.current.focus();
  }, []);

  return (
    <TextInputContainer>
      <InputLabelAndHelp label={props.labelAbove} labelHelp={props.labelHelp} />
      <InputWrapper style={props.style}>
        <WrappedInput
          type={props.type}
          inputRef={nameInput}
          value={props.valueEntered ?? ""}
          headerStyle={!!props.headerStyle}
          placeholder={props.placeholder ?? placeholder}
          onChange={(e) => props.onValueChange(e.target.value)}
          onBlur={props.onBlur}
          onKeyDown={props.onKeyDown}
          debounceTimeout={InputTextTimeoutMs}
        />
        {props.children}
      </InputWrapper>
    </TextInputContainer>
  );
};

export default InputText;
