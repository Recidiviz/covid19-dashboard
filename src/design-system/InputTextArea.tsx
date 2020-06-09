import React, { useEffect, useRef } from "react";
import styled from "styled-components";

import { InputStyle } from "./Input";
import TextLabel from "./TextLabel";

interface Props {
  label?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  focus?: boolean;
  required?: boolean;
  onValueChange: (value: any | undefined) => void;
}

const TextArea = styled.textarea`
  ${InputStyle}
  padding: 16px 16px;
  height: 96px;
`;

const TextAreaContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
`;

const InputTextArea: React.FC<Props> = (props) => {
  const nameTextArea = useRef() as React.MutableRefObject<HTMLTextAreaElement>;

  useEffect(() => {
    if (!props.focus) return;

    nameTextArea.current.focus();
  }, []);

  return (
    <TextAreaContainer>
      <TextLabel>{props.label}</TextLabel>
      <TextArea
        ref={nameTextArea}
        value={props.value}
        placeholder={props.placeholder}
        required={props.required}
        onChange={(e) => props.onValueChange(e.target.value)}
        onBlur={props.onBlur}
        onKeyDown={props.onKeyDown}
      />
    </TextAreaContainer>
  );
};

export default InputTextArea;
