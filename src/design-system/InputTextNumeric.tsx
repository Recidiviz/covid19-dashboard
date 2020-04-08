import React from "react";

import InputText from "./InputText";

interface Props {
  label?: string;
  placeholder?: string | number;
  value?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string;
  type: "number" | "percent";
}

const InputTextNumeric: React.FC<Props> = (props) => {
  return (
    <InputText
      type="number"
      label={props.label}
      placeholder={props.placeholder?.toString()}
      value={props.value?.toString()}
    >
      {props.type === "percent" && <>%</>}
    </InputText>
  );
};

export default InputTextNumeric;
