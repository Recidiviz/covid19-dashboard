import { uniqueId } from "lodash";
import React, { useState } from "react";
import styled from "styled-components";

import Colors from "./Colors";
import TextLabel from "./TextLabel";

interface Props {
  checked?: boolean;
  onChange: (e: React.ChangeEvent) => void;
  label?: string;
}

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: row nowrap;
  padding: 10px;
`;

const CheckboxInput = styled.input`
  margin-right: 5px;
  color: ${Colors.forest};
`;

const InputCheckbox: React.FC<Props> = (props) => {
  const [inputId] = useState(uniqueId("CheckboxInput_"));
  const { checked, onChange } = props;

  return (
    <CheckboxContainer>
      <CheckboxInput
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <TextLabel>{props.label}</TextLabel>
    </CheckboxContainer>
  );
};

export default InputCheckbox;
