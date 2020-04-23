import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import iconEditSrc from "../design-system/icons/ic_edit.svg";
import InputTextArea from "../design-system/InputTextArea";

const inputTextAreaStyle = {
  fontFamily: "Helvetica Neue",
  fontSize: "13px",
  color: Colors.forest,
};

const DescriptionDiv = styled.div`
  min-height: 100px;
  padding: 20px 0;
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
}

const InputDescription: React.FC<Props> = ({ description, setDescription }) => {
  const [editingDescription, setEditingDescription] = useState(false);

  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;
    onEnter();
  };

  const updateDescription = () => {
    setEditingDescription(false);
    setDescription(description);
  };

  return (
    <DescriptionDiv>
      {!editingDescription ? (
        <Description onClick={() => setEditingDescription(true)}>
          <span>{description || "Enter a description (optional)"}</span>
        </Description>
      ) : (
        <Description>
          <InputTextArea
            fillVertical
            style={inputTextAreaStyle}
            autoResizeVertically
            value={description}
            placeholder={""}
            onBlur={updateDescription}
            onChange={(event) => setDescription(event.target.value)}
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
