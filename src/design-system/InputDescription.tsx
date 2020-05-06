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
    "placeholderValue" | "placeholderText" | "maxLengthValue" | "requiredFlag"
  > {
  description?: string | undefined;
  persistChanges?: (changes: { description: string | undefined }) => void;
  setDescription: (description?: string) => void;
}

const InputDescription: React.FC<Props> = ({
  description,
  setDescription,
  persistChanges,
  ...passThruProps
}) => {
  return (
    <EditInPlace
      autoResizeVertically
      BaseComponent={Description}
      initialValue={description}
      minHeight={100}
      persistChanges={(description: string | undefined) =>
        persistChanges && persistChanges({ description })
      }
      setInitialValue={setDescription}
      {...passThruProps}
    />
  );
};

export default InputDescription;
