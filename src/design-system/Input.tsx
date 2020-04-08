import { useEffect, useState } from "react";

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

export function useInputValue<T, P extends InputValueProps<T>>(props: P) {
  let [hasEnteredValue, setHasEnteredValue] = useState(
    Boolean(props.valueEntered),
  );

  useEffect(() => {
    if (!hasEnteredValue && props.valueEntered) {
      setHasEnteredValue(true);
    }
  }, [props.valueEntered]);

  if (hasEnteredValue) return props.valueEntered;
  else return props.valueEntered ?? props.valueDefault;
}

export type InputBaseProps<T> = InputLabelProps & InputValueProps<T>;
