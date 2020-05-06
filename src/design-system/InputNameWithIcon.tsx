import React, { useState } from "react";
import styled from "styled-components";

import Colors from "./Colors";
import iconEditSrc from "./icons/ic_edit.svg";
import iconFolderSrc from "./icons/ic_folder.svg";
import InputText from "./InputText";

const requiredInputStyle = {
  outline: "none",
};

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
  flex: 1 1 auto;
  font-size: 24px;
  font-family: Libre Baskerville;
  font-weight: normal;
  letter-spacing: -0.06em;
  line-height: 24px;
`;

interface Props {
  name?: string | undefined;
  setName: (name?: string) => void;
  placeholderValue?: string | undefined;
  placeholderText?: string | undefined;
  maxLengthValue?: number | undefined;
  requiredFlag?: boolean;
  persistChanges?: (changes: object) => void;
  showIcon?: boolean;
}

const InputNameWithIcon: React.FC<Props> = ({
  name,
  setName,
  placeholderValue,
  placeholderText,
  maxLengthValue,
  requiredFlag,
  persistChanges,
  showIcon,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [value, setValue] = useState(name);

  // Reset Name field border
  if (!editingName) requiredInputStyle.outline = "none";

  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;
    onEnter();
  };

  const updateName = () => {
    if ((requiredFlag && value?.trim()) || !requiredFlag) {
      setEditingName(false);
      setName(value);
      if (persistChanges) {
        persistChanges({ name: value });
      }
    } else {
      setEditingName(true);
      setName("");
      if (persistChanges) {
        persistChanges({ name: "" });
      }
    }

    if (requiredFlag && !value?.trim()) {
      requiredInputStyle.outline = `1px solid ${Colors.red}`;
    } else {
      requiredInputStyle.outline = "none";
    }
  };

  return (
    <NameLabelDiv>
      {!editingName && ((requiredFlag && name) || !requiredFlag) ? (
        <Heading onClick={() => setEditingName(true)}>
          {showIcon && <IconFolder alt="folder" src={iconFolderSrc} />}
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
          maxLength={maxLengthValue}
          placeholder={placeholderText || ""}
          required={requiredFlag}
          style={requiredInputStyle}
        />
      )}
      <IconEdit alt="Name" src={iconEditSrc} />
    </NameLabelDiv>
  );
};

export default InputNameWithIcon;
