import { DebounceInput } from "react-debounce-input";
import { css } from "styled-components";

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

/**
 * This component has the same functionality as DebounceInput, except that it
 * removes the type parameter. This is because we can't use DebounceInput as-is
 * with styled-components. Specifically, we cannot do the following
 *
 *     let MyComponent = styled(DebounceInput<HTMLInputElement>)`
 *       ...
 *     `
 *
 * because it's invalid syntax.
 *
 * NOTE: This trick currently depends on DebounceInput being implemented as a
 * class component. If it becomes a function component in the future, then we
 * might need to use the slightly more complicated method of building a wrapper
 * component (but it can that component can be used the same way).
 *
 * NOTE: If a future version of TypeScript/JSX/styled-components allows us to do
 * this (or if there's an easier way to do this), then we should use that method
 * instead.
 */
export class CustomDebounceInput extends DebounceInput<HTMLInputElement> {}

export const InputStyle = css`
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

  &::-ms-clear {
    display: none;
    height: 0;
    width: 0;
  }
`;
