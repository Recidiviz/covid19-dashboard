import React from "react";
import styled from "styled-components";

import Colors from "./Colors";
import TextLabel from "./TextLabel";

interface Props {
  label?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  required?: boolean;
}

const TextAreaInput = styled.textarea`
  margin-top: 8px;
  border: none;
  padding: 16px;
  background: #e0e4e4;
  border-radius: 2px;
  color: ${(props) => props.color || Colors.green};
  resize: none;
  width: 100%;

  // make placeholder font size smaller than the textarea's
  &::-webkit-input-placeholder {
    font-size: 18px;
  }
  &::-moz-placeholder {
    font-size: 18px;
  }
  &:-ms-input-placeholder {
    font-size: 18px;
  }
  &:-moz-placeholder {
    font-size: 18px;
  }
`;

const TextAreaContainer = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
`;

const InputTextArea: React.FC<Props> = (props) => {
  return (
    <TextAreaContainer>
      <TextLabel>{props.label}</TextLabel>
      <TextAreaInput
        onChange={props.onChange}
        onBlur={props.onBlur}
        value={props.value}
        placeholder={props.placeholder}
        required={props.required}
        name={props.label}
        onKeyDown={props.onKeyDown}
      />
    </TextAreaContainer>
  );
};

export default InputTextArea;
