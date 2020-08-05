import React from "react";
import styled from "styled-components";

import { InputBaseProps } from "./Input";
import InputText from "./InputText";

interface Props extends InputBaseProps<number> {
  type: "number" | "percent";
  style?: React.CSSProperties;
  inputRelativityError?: boolean;
  isReference?: boolean;
}

const PctAddon = styled.div`
  margin-left: 6px;
`;

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
      const valueIsNumber = (value * 100).toFixed(0);
      const valueIsString = `${valueIsNumber}`;

      return valueIsString;
    } else {
      return `${value}`;
    }
  }

  if (props.isReference) {
    console.log("inputtextnumeric", props);
  }

  return (
    <InputText
      {...props}
      type="number"
      valueEntered={formatValue(props.valueEntered)}
      onValueChange={onValueChange}
      inputRelativityError={props.inputRelativityError}
      labelPlaceholder={props.labelPlaceholder ?? "0"}
    >
      {props.type === "percent" && <PctAddon>%</PctAddon>}
    </InputText>
  );
};

export default InputTextNumeric;
