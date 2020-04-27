import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { deleteFacility, saveFacility } from "../database/index";
import Colors from "../design-system/Colors";
import InputButton, { StyledButton } from "../design-system/InputButton";
import InputDescription from "../design-system/InputDescription";
import InputNameWithIcon from "../design-system/InputNameWithIcon";
import ModalDialog from "../design-system/ModalDialog";
import PopUpMenu from "../design-system/PopUpMenu";
import ChartArea from "../impact-dashboard/ChartArea";
import FacilityInformation from "../impact-dashboard/FacilityInformation";
import ImpactProjectionTable from "../impact-dashboard/ImpactProjectionTableContainer";
import MitigationInformation from "../impact-dashboard/MitigationInformation";
import useModel from "../impact-dashboard/useModel";
import { FacilityContext } from "./FacilityContext";
import LocaleInformationSection from "./LocaleInformationSection";

const FacilityInputFormDiv = styled.div`
  display: flex;
  flex-direction: row;
`;
const LeftColumn = styled.div`
  margin: 20px;
  width: 45%;
`;
const RightColumn = styled.div`
  margin: 20px;
  width: 55%;
`;

const ButtonSection = styled.div`
  margin-top: 30px;
`;

const DescRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const PopUpMenuWrapper = styled.div`
  padding-top: 12px;
`;

// Delete Modal elements
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

const borderStyle = `1px solid ${Colors.paleGreen}`;

export const SectionHeader = styled.header`
  font-family: Libre Baskerville;
  font-weight: normal;
  font-size: 19px;
  line-height: 24px;
  padding: 20px 0;
  color: ${Colors.forest};
  letter-spacing: -0.06em;
  border-top: ${borderStyle};
`;

interface Props {
  scenarioId: string;
}

const FacilityInputForm: React.FC<Props> = ({ scenarioId }) => {
  const { facility } = useContext(FacilityContext);
  const history = useHistory();
  const [facilityName, setFacilityName] = useState(facility?.name || undefined);
  const [description, setDescription] = useState(
    facility?.description || undefined,
  );
  const [systemType, setSystemType] = useState(
    facility?.systemType || undefined,
  );
  const model = useModel();

  const save = () => {
    saveFacility(scenarioId, {
      id: facility?.id,
      name: facilityName || null,
      description: description || null,
      systemType: systemType || null,
      modelInputs: JSON.parse(JSON.stringify(model))[0],
    }).then((_) => {
      history.push("/");
    });
  };

  // delete modal stuff
  const [showDeleteModal, updateShowDeleteModal] = useState(false);
  const openDeleteModal = () => {
    updateShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    updateShowDeleteModal(false);
  };
  const popupItems = [{ name: "Delete", onClick: openDeleteModal }];
  const removeFacility = async () => {
    const facilityId = facility?.id;
    if (facilityId) {
      await deleteFacility(scenarioId, facilityId);
      history.goBack();
    }
    updateShowDeleteModal(false);
  };

  return (
    <FacilityInputFormDiv>
      <LeftColumn>
        <InputNameWithIcon
          name={facilityName}
          setName={setFacilityName}
          placeholderValue="Unnamed Facility"
        />
        <DescRow>
          <InputDescription
            description={description}
            setDescription={setDescription}
            placeholderValue="Enter a description (optional)"
          />
          <PopUpMenuWrapper>
            <PopUpMenu items={popupItems} />
          </PopUpMenuWrapper>
        </DescRow>
        <div className="mt-5 mb-5 border-b border-gray-300" />

        <LocaleInformationSection
          systemType={systemType}
          setSystemType={setSystemType}
        />
        <SectionHeader>Facility Details</SectionHeader>
        <FacilityInformation />
        <SectionHeader>Rate of Spread</SectionHeader>
        <MitigationInformation />
        <ButtonSection>
          <InputButton label="Save" onClick={save} />
        </ButtonSection>
        <div className="mt-8" />
      </LeftColumn>
      <RightColumn>
        <ChartArea />
        <ImpactProjectionTable />
      </RightColumn>

      {/* MODAL */}
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
              onClick={removeFacility} // replace with actual delete function (pass ID)
            >
              Delete facility
            </DeleteButton>
            <CancelButton onClick={closeDeleteModal}>Cancel</CancelButton>
          </ModalButtons>
        </ModalContents>
      </ModalDialog>
    </FacilityInputFormDiv>
  );
};

export default FacilityInputForm;
