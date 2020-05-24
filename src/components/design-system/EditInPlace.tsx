import React, { useEffect, useRef, useState } from "react";
import styled, { StyledComponent } from "styled-components";

import Colors from "./Colors";
import iconEditSrc from "./icons/ic_edit.svg";

const EditInPlaceDiv = styled.div<Pick<Props, "minHeight">>`
  min-height: ${(props) => props.minHeight}px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .edit-in-place__input {
    background-color: ${Colors.gray};
    box-shadow: none;
    height: 100%;
    outline: none;
    outline-offset: 0;
    resize: none;
    width: 100%;

    &:invalid {
      outline: 1px solid ${Colors.red};
    }
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
  textArea.style.height = "0";
  const height = textArea.scrollHeight;
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
  minHeight: number;
  requiredFlag?: boolean;
  persistChanges?: (changes: string | undefined) => void;
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
  minHeight,
}) => {
  const [editing, setEditing] = useState(false);
  const textAreaRef = useRef(null);

  const [value, setValue] = useState(initialValue);

  const valueIsInvalid = requiredFlag && !value?.trim();

  useEffect(() => {
    if (autoResizeVertically) {
      resize(textAreaRef.current);
    }
  }, [autoResizeVertically, editing, value]);

  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;
    else if (event.key === "Enter" && valueIsInvalid) {
      event.preventDefault();
      return;
    }
    onEnter();
  };

  const updateValue = () => {
    if (valueIsInvalid) {
      setEditing(true);
      setInitialValue("");
      if (persistChanges) {
        persistChanges("");
      }
    } else {
      setEditing(false);
      setInitialValue(value);
      if (persistChanges) {
        persistChanges(value);
      }
    }
  };

  return (
    <EditInPlaceDiv minHeight={minHeight}>
      {!editing && ((requiredFlag && value) || !requiredFlag) ? (
        <BaseComponent onClick={() => setEditing(true)}>
          <span>{value || placeholderValue}</span>
        </BaseComponent>
      ) : (
        <BaseComponent
          as="textarea"
          autoFocus
          className="edit-in-place__input"
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
