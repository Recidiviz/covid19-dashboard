import React from "react";
import styled from "styled-components";

import Colors from "./Colors";
import EditInPlace, { Props as EditInPlaceProps } from "./EditInPlace";

interface NameLabelDivProps {
  border?: boolean;
}

const borderStyle = `1px solid ${Colors.paleGreen}`;

const NameLabelDiv = styled.label<NameLabelDivProps>`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  padding-bottom: 15px;
  border-bottom: ${(props) => (props.border ? borderStyle : "none")};
  font-size: 24px;
  font-family: Libre Baskerville;
  font-weight: normal;
  letter-spacing: -0.06em;
  line-height: 24px;
`;

const Heading = styled.h1`
  color: ${Colors.forest};
  flex: 1 1 auto;
  font-size: 24px;
  font-family: Libre Baskerville;
  font-weight: normal;
  letter-spacing: -0.06em;
  line-height: 24px;
`;

interface Props
  extends Pick<
    EditInPlaceProps,
    "placeholderValue" | "placeholderText" | "maxLengthValue" | "requiredFlag"
  > {
  name?: string | undefined;
  persistChanges?: (changes: { name: string | undefined }) => void;
  setName: (name?: string) => void;
  border?: boolean;
}

const InputName: React.FC<Props> = ({
  name,
  persistChanges,
  setName,
  border,
  ...passThruProps
}) => {
  return (
    <NameLabelDiv border={border}>
      <EditInPlace
        autoResizeVertically
        BaseComponent={Heading}
        initialValue={name}
        minHeight={30}
        persistChanges={(name: string | undefined) =>
          persistChanges && persistChanges({ name })
        }
        setInitialValue={setName}
        {...passThruProps}
      />
    </NameLabelDiv>
  );
};

export default InputName;
