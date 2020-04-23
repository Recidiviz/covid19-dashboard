import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import iconEditSrc from "../design-system/icons/ic_edit.svg";
import iconFolderSrc from "../design-system/icons/ic_folder.svg";
import InputText from "../design-system/InputText";

const FacilityNameLabelDiv = styled.label`
  align-items: baseline;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 75%,
  padding-right: 25%
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

  ${FacilityNameLabelDiv}:hover & {
    visibility: visible;
  }
`;

const FacilityHeading = styled.h1`
  color: ${Colors.forest};
  font-size: 24px;
  line-height: 1.2;
`;

interface Props {
  facilityName?: string | undefined;
  setFacilityName: (facilityName?: string) => void;
}

const InputFacilityName: React.FC<Props> = ({
  facilityName,
  setFacilityName,
}) => {
  const [editingName, setEditingName] = useState(false);

  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;
    onEnter();
  };

  const updateName = () => {
    setEditingName(false);
    setFacilityName(facilityName);
  };

  return (
    <FacilityNameLabelDiv>
      {!editingName ? (
        <FacilityHeading onClick={() => setEditingName(true)}>
          <IconFolder alt="folder" src={iconFolderSrc} />
          <span>{facilityName || "Unnamed Facility"}</span>
        </FacilityHeading>
      ) : (
        <InputText
          type="text"
          headerStyle={true}
          focus={true}
          valueEntered={facilityName}
          onValueChange={(value) => setFacilityName(value)}
          onBlur={() => updateName()}
          onKeyDown={(event) =>
            onEnterPress(event, updateName)
          }
        />
      )}
      <IconEdit alt="Facility name" src={iconEditSrc} />
    </FacilityNameLabelDiv>
  );
};

export default InputFacilityName;
