import classNames from "classnames";
import React, { useState } from "react";
import styled from "styled-components";

import Colors from "./Colors";
import iconEditSrc from "./icons/ic_edit.svg";

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

const TextArea = styled.textarea`
  color: ${Colors.forest};
  font-size: 13px;
  height: 100%;
  width: 100%;

  &.has-invalid-input {
    box-shadow: #ff0000 0px 0px 1.5px 1px;
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
  };

  return (
    <DescriptionDiv>
      {!editingDescription && ((requiredFlag && value) || !requiredFlag) ? (
        <Description onClick={() => setEditingDescription(true)}>
          <span>{value || placeholderValue}</span>
        </Description>
      ) : (
        <Description>
          <TextArea
            className={classNames({
              "has-invalid-input": requiredFlag && !value?.trim(),
            })}
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
