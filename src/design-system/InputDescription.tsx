import React, { useState } from "react";
import styled from "styled-components";

import Colors from "./Colors";
import iconEditSrc from "./icons/ic_edit.svg";
import InputTextArea from "./InputTextArea";

const inputTextAreaStyle = {
  fontFamily: "Helvetica Neue",
  fontSize: "13px",
  color: Colors.forest,
  outline: "none",
};

const DescriptionDiv = styled.div`
  min-height: 100px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Description = styled.label`
  color: ${Colors.forest};
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  font-weight: 400;
`;

const IconEdit = styled.img`
  flex: 0 0 auto;
  height: 10px;
  margin-left: 10px;
  width: 10px;
  visibility: hidden;

  ${DescriptionDiv}:hover & {
    visibility: visible;
  }
`;

interface Props {
  description?: string | undefined;
  setDescription: (description?: string) => void;
  placeholderValue?: string | undefined;
  placeholderText?: string | undefined;
  maxLengthValue?: number | undefined;
  requiredFlag?: boolean;
  persistChanges?: (changes: { description: string | undefined }) => void;
}

const InputDescription: React.FC<Props> = ({
  description,
  setDescription,
  placeholderValue,
  placeholderText,
  maxLengthValue,
  requiredFlag,
  persistChanges,
}) => {
  const [editingDescription, setEditingDescription] = useState(false);
  const [value, setValue] = useState(description);

  // Reset Description field border
  if (!editingDescription) inputTextAreaStyle.outline = "none";

  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;
    else if (event.key === "Enter" && requiredFlag && !value?.trim()) {
      event.preventDefault();
      return;
    }
    onEnter();
  };

  const updateDescription = () => {
    if ((requiredFlag && value?.trim()) || !requiredFlag) {
      setEditingDescription(false);
      setDescription(value);
      if (persistChanges) {
        persistChanges({ description: value });
      }
    } else {
      setEditingDescription(true);
      setDescription("");
      if (persistChanges) {
        persistChanges({ description: "" });
      }
    }

    if (requiredFlag && !value?.trim()) {
      inputTextAreaStyle.outline = `1px solid ${Colors.red}`;
    } else {
      inputTextAreaStyle.outline = "none";
    }
  };

  return (
    <DescriptionDiv>
      {!editingDescription && ((requiredFlag && value) || !requiredFlag) ? (
        <Description onClick={() => setEditingDescription(true)}>
          <span>{value || placeholderValue}</span>
        </Description>
      ) : (
        <Description>
          <InputTextArea
            fillVertical
            style={inputTextAreaStyle}
            autoResizeVertically
            value={value}
            placeholder={placeholderText || ""}
            maxLength={maxLengthValue}
            required={requiredFlag}
            onBlur={updateDescription}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              onEnterPress(event, updateDescription);
            }}
          />
        </Description>
      )}
      <IconEdit alt="Description" src={iconEditSrc} />
    </DescriptionDiv>
  );
};

export default InputDescription;
