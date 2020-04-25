import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { deleteFacility, saveFacility } from "../database/index";
import Colors from "../design-system/Colors";
import InputButton, { StyledButton } from "../design-system/InputButton";
import InputText from "../design-system/InputText";
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

// mockup divs and menu items
const TestDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TestTitle = styled.div`
  margin: auto 0;
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

// TODO add section header tooltips
// TODO add summary at bottom of Locale Information
const FacilityInputForm: React.FC = () => {
  const { facility } = useContext(FacilityContext);
  const history = useHistory();
  const [facilityName, setFacilityName] = useState(facility?.name);
  const [systemType, setSystemType] = useState(
    facility?.systemType || undefined,
  );
  const model = useModel();

  const save = () => {
    saveFacility({
      id: facility?.id,
      name: facilityName || "Unnamed Facility",
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
  const popupItems = [
    {
      name: "Something",
      onClick: () => console.log("click something "),
    },
    { name: "Delete", onClick: openDeleteModal },
  ];
  const removeFacility = async () => {
    const id = facility?.id;
    if (id) {
      await deleteFacility(id);
      history.goBack();
    }
    updateShowDeleteModal(false);
  };

  return (
    <FacilityInputFormDiv>
      <LeftColumn>
        <InputText
          type="text"
          valueEntered={facilityName}
          valuePlaceholder="Unnamed Facility"
          onValueChange={(value) => setFacilityName(value)}
        />
        <div className="mt-5 mb-5 border-b border-gray-300" />

        <TestDiv>
          <TestTitle>SOMETHIGN HERE</TestTitle>
          <PopUpMenu items={popupItems} />
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
        </TestDiv>

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
    </FacilityInputFormDiv>
  );
};

export default FacilityInputForm;
