import React from "react";
import styled, { css } from "styled-components";

import TextLabel from "./TextLabel";

interface Props {
  label?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  inline?: boolean;
  fillVertical?: boolean;
}

interface InputProps {
  inline?: boolean;
  fillVertical?: boolean;
}

const TextAreaInput = styled.textarea<InputProps>`
  margin-top: 8px;
  border: none;
  outline: none;
  padding: 16px;
  background: #e0e4e4;
  border-radius: 2px;
  font-size: 16px;
  color: #00413e;
  resize: none;
  font-family: "Poppins", sans-serif;

  ${(props) =>
    props.inline &&
    css`
      margin: 0 !important;
      padding: 0 !important;
      font-size: inherit;
      background-color: transparent;
    `};

  ${(props) =>
    props.fillVertical &&
    css`
      height: 100%;
    `};
`;

interface TextAreaContainer {
  fillVertical?: boolean;
}

const TextAreaContainer = styled.div<TextAreaContainer>`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;

  ${(props) =>
    props.fillVertical &&
    css`
      height: 100%;
    `};
`;

const InputTextArea: React.FC<Props> = (props) => {
  return (
    <TextAreaContainer fillVertical={!!props.fillVertical}>
      <TextLabel>{props.label}</TextLabel>
      <TextAreaInput
        inline={!!props.inline}
        fillVertical={!!props.fillVertical}
        onChange={props.onChange}
        value={props.value}
        placeholder={props.placeholder}
        name={props.label}
      />
    </TextAreaContainer>
  );
};

export default InputTextArea;
