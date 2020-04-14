import { useEffect, useState } from "react";
import styled from "styled-components";

import Colors from "./Colors";

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
  background: ${Colors.gray};
  border-radius: 2px;
  border: none;
  box-shadow: none;
  box-sizing: border-box;
  color: ${Colors.forest};
  flex: 1 1 auto;
  font: 16px/1.2 "Rubik", sans-serif;
  height: 48px;
  margin-top: 8px;
  outline: 0 solid transparent;
  padding: 0 16px;
  width: 100%;
`;
