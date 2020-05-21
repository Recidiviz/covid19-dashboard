import styled, { css } from "styled-components";

import Colors from "./Colors";

export interface InputLabelProps {
  labelAbove?: string;
  labelHelp?: string;
  labelPlaceholder?: string;
}

export interface InputValueProps<T> {
  valueEntered: T | undefined;
  valuePlaceholder?: T;
  onValueChange: (value: T | undefined) => void;
}

export type InputBaseProps<T> = InputLabelProps & InputValueProps<T>;

interface InputProps {
  headerStyle?: boolean;
}

export const StyledInput = styled.input<InputProps>`
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

  ${(props) =>
    props.headerStyle &&
    css`
      font-family: "Libre Baskerville", serif;
      font-style: normal;
      font-weight: normal;
      font-size: 64px;
      line-height: 64px;
      letter-spacing: -0.03em;
      color: #006c67;
      font-size: 1.875rem;
      margin: 0 !important;
      padding: 0 !important;
      background-color: transparent;
    `};
`;
