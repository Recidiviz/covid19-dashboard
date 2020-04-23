import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { saveFacility } from "../database/index";
import Colors, { MarkColors as markColors } from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import iconEditSrc from "../design-system/icons/ic_edit.svg";
import { StyledButton } from "../design-system/InputButton";
import InputTextArea from "../design-system/InputTextArea";
import ModalDialog from "../design-system/ModalDialog";
import CurveChartContainer from "../impact-dashboard/CurveChartContainer";
import {
  totalConfirmedCases,
  useEpidemicModelState,
} from "../impact-dashboard/EpidemicModelContext";
import { FacilityContext } from "./FacilityContext";
import { Facility } from "./types";

const groupStatus = {
  exposed: true,
  fatalities: true,
  hospitalized: true,
  infectious: true,
};

const ModalContents = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: normal;
  justify-content: flex-start;
  margin-top: 30px;
`;

const ModalText = styled.div`
  font-size: 13px;
  margin-right: 25px;
`;

const ModalButtons = styled.div`
  /* display: flex;
  flex-direction: column; */
`;

const ModalButton = styled(StyledButton)`
  font-size: 14px;
  font-weight: normal;
`;

const DeleteButton = styled(ModalButton)`
  background: ${Colors.darkRed};
  color: ${Colors.white};
  margin-right: 15px;
`;

const CancelButton = styled(ModalButton)`
  background: transparent;
  border: 1px solid ${Colors.forest};
  color: ${Colors.forest};
`;

const FacilityNameLabel = styled.label`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 100%;
  padding-right: 25px;
  width: 75%;
`;

const IconEdit = styled.img`
  align-self: flex-start;
  flex: 0 0 auto;
  height: 10px;
  margin-left: 10px;
  visibility: hidden;
  width: 10px;
  ${FacilityNameLabel}:hover & {
    visibility: visible;
  }
`;

const DataContainer = styled.div`
  border-color: ${Colors.opacityGray};
`;

const CaseText = styled.div`
  color: ${Colors.darkRed};
`;

// TODO: validate the arguments?
const handleSubClick = (fn?: Function, ...args: any[]) => {
  return (event: React.MouseEvent<Element>) => {
    // This is required or else the openFacilityPage onClick will fire
    // since the Delete button lives within the same div that opens the
    // Facility Details page.
    event.stopPropagation();
    if (fn) fn(...args);
  };
};

interface Props {
  deleteFn: (id: string) => void;
  facility: Facility;
}

const FacilityRow: React.FC<Props> = ({
  deleteFn,
  facility: initialFacility,
}) => {
  const confirmedCases = totalConfirmedCases(useEpidemicModelState());
  const history = useHistory();
  const { setFacility } = useContext(FacilityContext);
  const [facility, updateFacility] = useState(initialFacility);

  const { id, name, updatedAt } = facility;

  const [showDeleteModal, updateShowDeleteModal] = useState(false);

  const openFacilityPage = () => {
    setFacility(facility);
    history.push("/facility");
  };

  const openDeleteModal = handleSubClick(updateShowDeleteModal, true);

  const closeDeleteModal = handleSubClick(updateShowDeleteModal, false);

  const removeFacility = handleSubClick(async () => {
    // In this context id should always be present, but TypeScript
    // is complaining so I'm adding this check to appease it.
    if (id) {
      await deleteFn(id);
    }
    updateShowDeleteModal(false);
  });

  return (
    <div onClick={openFacilityPage} className="cursor-pointer">
      <DataContainer className="flex flex-row mb-8 border-b">
        <div className="w-2/5 flex flex-col justify-between">
          <div className="flex flex-row h-full">
            <CaseText className="w-1/4 font-bold">{confirmedCases}</CaseText>
            <FacilityNameLabel onClick={handleSubClick()}>
              <InputTextArea
                inline={true}
                fillVertical={true}
                value={name}
                onChange={(event) => {
                  const newName = (event.target.value || "").replace(
                    /(\r\n|\n|\r)/gm,
                    "",
                  );
                  // this updates the local state
                  updateFacility({ ...facility, name: newName });
                  // this persists the changes to the database
                  saveFacility({
                    id,
                    name: newName,
                  });
                }}
              />
              <IconEdit alt="Edit facility name" src={iconEditSrc} />
            </FacilityNameLabel>
          </div>
          <div className="text-xs text-gray-500 pb-4 flex flex-row justify-between">
            <div>
              Last Update: <DateMMMMdyyyy date={new Date(updatedAt.toDate())} />
            </div>
            <div className="mr-8">
              <a className="px-1" href="#" onClick={openDeleteModal}>
                Delete
              </a>
              <ModalDialog
                closeModal={closeDeleteModal}
                open={showDeleteModal}
                title="Are you sure?"
              >
                <ModalContents>
                  <ModalText>This action cannot be undone.</ModalText>
                  <ModalButtons>
                    <DeleteButton
                      label="Delete facility"
                      onClick={removeFacility}
                    >
                      Delete facility
                    </DeleteButton>
                    <CancelButton onClick={closeDeleteModal}>
                      Cancel
                    </CancelButton>
                  </ModalButtons>
                </ModalContents>
              </ModalDialog>
            </div>
          </div>
        </div>
        <div className="w-3/5">
          <CurveChartContainer
            chartHeight={200}
            groupStatus={groupStatus}
            markColors={markColors}
          />
        </div>
      </DataContainer>
    </div>
  );
};

export default FacilityRow;
