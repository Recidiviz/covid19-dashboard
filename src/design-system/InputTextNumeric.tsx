import React from "react";

import { InputBaseProps } from "./Input";
import InputText from "./InputText";

interface Props extends InputBaseProps<number> {
  type: "number" | "percent";
}

const InputTextNumeric: React.FC<Props> = (props) => {
  function onValueChange(value: string | undefined) {
    if (value == null || value === "") {
      return props.onValueChange(undefined);
    }

    let valueAsFloat = parseFloat(value);
    if (Number.isNaN(valueAsFloat)) return;
    if (props.type === "percent") valueAsFloat = valueAsFloat / 100;

    return props.onValueChange(valueAsFloat);
  }

  function formatValue(value: number | undefined) {
    if (value == null) return undefined;

    if (props.type === "percent") {
      return `${value * 100}`;
    } else {
      return `${value}`;
    }
  }

  return (
    <InputText
      {...props}
      type="number"
      valueEntered={formatValue(props.valueEntered)}
      valueDefault={formatValue(props.valueDefault)}
      valuePlaceholder={formatValue(props.valuePlaceholder)}
      onValueChange={onValueChange}
      labelPlaceholder={
        props.labelPlaceholder ??
        (props.type === "number" ? "Enter number" : "Enter a percentage")
      }
    />
  );
};

export default InputTextNumeric;
