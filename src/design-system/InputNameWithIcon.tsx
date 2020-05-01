import React, { useState } from "react";
import styled from "styled-components";

import Colors from "./Colors";
import iconEditSrc from "./icons/ic_edit.svg";
import iconFolderSrc from "./icons/ic_folder.svg";
import InputText from "./InputText";

const borderStyle = `1px solid ${Colors.paleGreen}`;

const NameLabelDiv = styled.label`
  align-items: baseline;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 75%,
  padding-right: 25%;
  padding-bottom: 15px;
  border-bottom: ${borderStyle};
`;

const IconFolder = styled.img`
  display: inline;
  width: 12px;
  height: 12px;
  margin-right: 12px;
`;

const IconEdit = styled.img`
  flex: 0 0 auto;
  height: 10px;
  margin-left: 10px;
  visibility: hidden;
  width: 10px;

  ${NameLabelDiv}:hover & {
    visibility: visible;
  }
`;

const Heading = styled.h1`
  color: ${Colors.forest};
  font-size: 24px;
  line-height: 24px;
  font-family: Libre Baskerville;
  font-weight: normal;
  letter-spacing: -0.06em;
`;

interface Props {
  name?: string | undefined;
  setName: (name?: string) => void;
  placeholderValue?: string | undefined;
  persistChanges?: (changes: object) => void;
}

const InputNameWithIcon: React.FC<Props> = ({
  name,
  setName,
  placeholderValue,
  persistChanges,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [value, setValue] = useState(name);
  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;
    onEnter();
  };

  const updateName = () => {
    setEditingName(false);
    setName(value);
    if (persistChanges) {
      persistChanges({ name: value });
    }
  };

  return (
    <NameLabelDiv>
      {!editingName ? (
        <Heading onClick={() => setEditingName(true)}>
          <IconFolder alt="folder" src={iconFolderSrc} />
          <span>{value || placeholderValue}</span>
        </Heading>
      ) : (
        <InputText
          type="text"
          headerStyle={true}
          focus={true}
          valueEntered={value}
          onValueChange={(value) => setValue(value)}
          onBlur={() => updateName()}
          onKeyDown={(event) => onEnterPress(event, updateName)}
        />
      )}
      <IconEdit alt="Name" src={iconEditSrc} />
    </NameLabelDiv>
  );
};

export default InputNameWithIcon;
