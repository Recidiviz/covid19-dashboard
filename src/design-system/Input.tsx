import { useEffect, useState } from "react";
import styled from "styled-components";

export interface InputLabelProps {
  labelAbove?: string;
  labelHelp?: string;
  labelPlaceholder?: string;
}

export interface InputValueProps<T> {
  valueEntered: T | undefined;
  valueDefault?: T;
  valuePlaceholder?: T;
  onValueChange: (value: T | undefined) => void;
}

export function useInputValue<T>(props: InputValueProps<T>) {
  // We display the default value when valueEntered has never existed. A naive
  // implementation would display the default value as long as valueEntered
  // currently does not exist, but this means that if the user clears the entire
  // input, it would immediately be populated with the default value -- this can
  // be unexpected behavior.
  let [shouldShowDefault, setShouldShowDefault] = useState(
    props.valueEntered == null,
  );

  useEffect(() => {
    // As soon as the user has entered some value, we should never show the
    // default value again.
    if (shouldShowDefault && props.valueEntered != null) {
      setShouldShowDefault(false);
    }
  }, [shouldShowDefault, props.valueEntered]);

  return shouldShowDefault ? props.valueDefault : props.valueEntered;
}

export type InputBaseProps<T> = InputLabelProps & InputValueProps<T>;

export const StyledInput = styled.input`
  background: #e0e4e4;
  border-radius: 2px;
  border: none;
  box-shadow: none;
  box-sizing: border-box;
  color: #00413e;
  flex: 1 1 auto;
  font-family: "Rubik", sans-serif;
  font-size: 16px;
  height: 48px;
  line-height: 1.2;
  margin-top: 8px;
  outline: 0 solid transparent;
  padding: 0 16px;
  width: 100%;
`;
