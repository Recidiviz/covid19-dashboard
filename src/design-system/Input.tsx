import React from "react";
import { DebounceInput, DebounceInputProps } from "react-debounce-input";
import styled from "styled-components";

import Colors from "./Colors";

export interface InputLabelProps {
  labelAbove?: string;
  labelHelp?: string;
  labelPlaceholder?: string;
}

export interface InputValueProps<T> {
  valueEntered: T | undefined;
  onValueChange: (value: T | undefined) => void;
}

export type InputBaseProps<T> = InputLabelProps & InputValueProps<T>;

type CustomDebounceInputProps = DebounceInputProps<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>;

const CustomDebounceInput: React.FC<CustomDebounceInputProps> = (props) => (
  <DebounceInput<HTMLInputElement> {...props} />
);

export const StyledInput = styled(CustomDebounceInput)`
  background: ${Colors.gray};
  border-radius: 2px;
  border: none;
  box-shadow: none;
  box-sizing: border-box;
  color: ${Colors.forest};
  flex: 1 1 auto;
  font: 13px/16px "Poppins", sans-serif;
  letter-spacing: -0.02em;
  height: 48px;
  margin-top: 8px;
  outline: 0 solid transparent;
  padding: 0 16px;
  width: 100%;
`;
