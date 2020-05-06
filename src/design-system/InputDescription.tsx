import React from "react";
import styled from "styled-components";

import Colors from "./Colors";
import EditInPlace, { Props as EditInPlaceProps } from "./EditInPlace";

const Description = styled.label`
  color: ${Colors.forest};
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  font-weight: 400;
`;

interface Props
  extends Pick<
    EditInPlaceProps,
    | "placeholderValue"
    | "placeholderText"
    | "maxLengthValue"
    | "requiredFlag"
    | "persistChanges"
  > {
  description?: string | undefined;
  setDescription: (description?: string) => void;
}

const InputDescription: React.FC<Props> = ({
  description,
  setDescription,
  ...passThruProps
}) => {
  return (
    <EditInPlace
      autoResizeVertically
      BaseComponent={Description}
      initialValue={description}
      setInitialValue={setDescription}
      {...passThruProps}
    />
  );
};

export default InputDescription;
