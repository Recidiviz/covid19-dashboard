import React, { useState } from "react";
import styled from "styled-components";

import Colors from "./Colors";
import iconEditSrc from "./icons/ic_edit.svg";
import InputTextArea from "./InputTextArea";

const inputTextAreaStyle = {
  fontFamily: "Helvetica Neue",
  fontSize: "13px",
  color: Colors.forest,
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
  persistChanges?: (changes: { description: string | undefined }) => void;
}

const InputDescription: React.FC<Props> = ({
  description,
  setDescription,
  placeholderValue,
  persistChanges,
}) => {
  const [editingDescription, setEditingDescription] = useState(false);
  const [value, setValue] = useState(description);
  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;
    onEnter();
  };

  const updateDescription = () => {
    setEditingDescription(false);
    setDescription(value);
    if (persistChanges) {
      persistChanges({ description: value });
    }
  };

  return (
    <DescriptionDiv>
      {!editingDescription ? (
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
            placeholder={""}
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
