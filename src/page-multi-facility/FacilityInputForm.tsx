import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import styled from "styled-components";

import { deleteFacility, saveFacility } from "../database/index";
import Colors from "../design-system/Colors";
import InputButton, { StyledButton } from "../design-system/InputButton";
import InputDescription from "../design-system/InputDescription";
import InputNameWithIcon from "../design-system/InputNameWithIcon";
import ModalDialog from "../design-system/ModalDialog";
import PopUpMenu from "../design-system/PopUpMenu";
import ChartArea from "../impact-dashboard/ChartArea";
import ImpactProjectionTable from "../impact-dashboard/ImpactProjectionTableContainer";
import MitigationInformation from "../impact-dashboard/MitigationInformation";
import useModel from "../impact-dashboard/useModel";
import { FacilityContext } from "./FacilityContext";
import FacilityInformationSection from "./FacilityInformationSection";
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

interface Props {
  scenarioId: string;
}

interface Props {
  scenarioId: string;
}

const FacilityInputForm: React.FC<Props> = ({ scenarioId }) => {
  const { facility } = useContext(FacilityContext);
  const [facilityName, setFacilityName] = useState(facility?.name || undefined);
  const [description, setDescription] = useState(
    facility?.description || undefined,
  );
  const [systemType, setSystemType] = useState(
    facility?.systemType || undefined,
  );
  const model = useModel();

  const save = () => {
    // When saving an object to Firestore, Firestore will reject it if it is not
    // serializable. This type enforces that what we are saving is serializable.
    // In the future, if we add new properties to the model that are not
    // serializable, we will get a TS error below.
    //
    // Definition inspired by the one posted here:
    // https://github.com/microsoft/TypeScript/issues/1897#issuecomment-338650717
    type JsonSerializable =
      | boolean
      | number
      | Date
      | string
      | undefined
      | JsonSerializable[]
      | { [key: string]: JsonSerializable };

    let modelInputs: JsonSerializable = {
      ...model[0],

      // We don't need to save localeDataSource.
      localeDataSource: undefined,
    };

    saveFacility(scenarioId, {
      id: facility?.id,
      name: facilityName || null,
      description: description || null,
      systemType: systemType || null,
      modelInputs,
    }).then(() => {
      navigate("/");
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
      window.history.back();
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
        <FacilityInformationSection />
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
