import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import styled, { StyledComponent } from "styled-components";

import Colors from "./Colors";
import iconEditSrc from "./icons/ic_edit.svg";

const EditInPlaceDiv = styled.div`
  min-height: 100px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .edit-in-place__input {
    background-color: ${Colors.gray};
    height: 100%;
    resize: none;
    width: 100%;
  }

  &.has-invalid-input {
    box-shadow: #ff0000 0px 0px 1.5px 1px;
  }
`;

const IconEdit = styled.img`
  flex: 0 0 auto;
  height: 10px;
  margin-left: 10px;
  width: 10px;
  visibility: hidden;

  ${EditInPlaceDiv}:hover & {
    visibility: visible;
  }
`;

function resize(textArea: HTMLTextAreaElement | null) {
  if (!textArea) return;
  textArea.style.height = "auto";
  const height =
    textArea.scrollHeight + textArea.offsetHeight - textArea.clientHeight;
  textArea.style.height = `${height}px`;
}

export interface Props {
  autoResizeVertically?: boolean;
  BaseComponent: StyledComponent<any, any>;
  initialValue?: string;
  setInitialValue: (description?: string) => void;
  placeholderValue?: string | undefined;
  placeholderText?: string | undefined;
  maxLengthValue?: number | undefined;
  requiredFlag?: boolean;
  persistChanges?: (changes: { description: string | undefined }) => void;
}

const EditInPlace: React.FC<Props> = ({
  autoResizeVertically,
  BaseComponent,
  initialValue,
  setInitialValue,
  placeholderValue,
  placeholderText,
  maxLengthValue,
  requiredFlag,
  persistChanges,
}) => {
  const [editing, setEditing] = useState(false);

  const textAreaRef = useRef(null);

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (autoResizeVertically) {
      resize(textAreaRef.current);
    }
  }, [autoResizeVertically, editing, value]);

  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;
    else if (event.key === "Enter" && requiredFlag && !value?.trim()) {
      event.preventDefault();
      return;
    }
    onEnter();
  };

  const updateValue = () => {
    if ((requiredFlag && value?.trim()) || !requiredFlag) {
      setEditing(false);
      setInitialValue(value);
      if (persistChanges) {
        persistChanges({ description: value });
      }
    } else {
      setEditing(true);
      setInitialValue("");
      if (persistChanges) {
        persistChanges({ description: "" });
      }
    }
  };

  return (
    <EditInPlaceDiv>
      {!editing && ((requiredFlag && value) || !requiredFlag) ? (
        <BaseComponent onClick={() => setEditing(true)}>
          <span>{value || placeholderValue}</span>
        </BaseComponent>
      ) : (
        <BaseComponent
          as="textarea"
          autoFocus
          className={classNames("edit-in-place__input", {
            "has-invalid-input": requiredFlag && !value?.trim(),
          })}
          maxLength={maxLengthValue}
          onBlur={updateValue}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setValue(event.target.value)
          }
          onKeyDown={(event: React.KeyboardEvent) => {
            onEnterPress(event, updateValue);
          }}
          placeholder={placeholderText || ""}
          ref={textAreaRef}
          required={requiredFlag}
          value={value}
        />
      )}
      <IconEdit alt="Description" src={iconEditSrc} />
    </EditInPlaceDiv>
  );
};

export default EditInPlace;
