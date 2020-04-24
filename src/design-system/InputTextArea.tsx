import React, { useEffect, useRef } from "react";
import styled, { css } from "styled-components";

import TextLabel from "./TextLabel";

interface Props {
  autoResizeVertically?: boolean;
  label?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  inline?: boolean;
  fillVertical?: boolean;
  style?: object;
}

interface InputProps {
  inline?: boolean;
  fillVertical?: boolean;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
}

const TextAreaInput = styled.textarea<InputProps>`
  margin-top: 8px;
  border: none;
  outline: none;
  padding: 16px;
  background: #e0e4e4;
  border-radius: 2px;
  font-size: ${(props) => props.fontSize || "16px"};
  color: ${(props) => props.color || "#00413e"};
  resize: none;
  font-family: ${(props) => props.fontFamily || '"Poppins", sans-serif'};
  width: 100%;
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

function resize(textArea: HTMLTextAreaElement | null) {
  if (!textArea) return;
  textArea.style.height = "auto";
  const height =
    textArea.scrollHeight + textArea.offsetHeight - textArea.clientHeight;
  textArea.style.height = `${height}px`;
}

const InputTextArea: React.FC<Props> = (props) => {
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (props.autoResizeVertically) {
      resize(textAreaRef.current);
    }
  }, [props.autoResizeVertically, props.value]);

  return (
    <TextAreaContainer fillVertical={!!props.fillVertical}>
      <TextLabel>{props.label}</TextLabel>
      <TextAreaInput
        ref={textAreaRef}
        inline={!!props.inline}
        fillVertical={!!props.fillVertical}
        onChange={props.onChange}
        onBlur={props.onBlur}
        value={props.value}
        placeholder={props.placeholder}
        name={props.label}
        onKeyDown={props.onKeyDown}
        {...props.style}
      />
    </TextAreaContainer>
  );
};

export default InputTextArea;
