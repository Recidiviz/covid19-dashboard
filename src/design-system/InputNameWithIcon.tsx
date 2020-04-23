import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import iconEditSrc from "../design-system/icons/ic_edit.svg";
import iconFolderSrc from "../design-system/icons/ic_folder.svg";
import InputText from "../design-system/InputText";

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
  line-height: 1.2;
`;

interface Props {
  name?: string | undefined;
  setName: (name?: string) => void;
  placeholder?: string | undefined;
}

const InputNameWithIcon: React.FC<Props> = ({ name, setName, placeholder }) => {
  const [editingName, setEditingName] = useState(false);

  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;
    onEnter();
  };

  const updateName = () => {
    setEditingName(false);
    setName(name);
  };

  return (
    <NameLabelDiv>
      {!editingName ? (
        <Heading onClick={() => setEditingName(true)}>
          <IconFolder alt="folder" src={iconFolderSrc} />
          <span>{name || placeholder}</span>
        </Heading>
      ) : (
        <InputText
          type="text"
          headerStyle={true}
          focus={true}
          valueEntered={name}
          onValueChange={(value) => setName(value)}
          onBlur={() => updateName()}
          onKeyDown={(event) => onEnterPress(event, updateName)}
        />
      )}
      <IconEdit alt="Name" src={iconEditSrc} />
    </NameLabelDiv>
  );
};

export default InputNameWithIcon;
