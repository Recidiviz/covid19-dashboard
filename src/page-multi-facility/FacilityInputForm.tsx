import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import styled from "styled-components";

import { deleteFacility, saveFacility } from "../database/index";
import Colors from "../design-system/Colors";
import iconDuplicatePath from "../design-system/icons/ic_duplicate.svg";
import InputButton, { StyledButton } from "../design-system/InputButton";
import InputDescription from "../design-system/InputDescription";
import InputName from "../design-system/InputName";
import ModalDialog from "../design-system/ModalDialog";
import { Column, PageContainer } from "../design-system/PageColumn";
import PopUpMenu from "../design-system/PopUpMenu";
import { Spacer } from "../design-system/Spacer";
import Tooltip from "../design-system/Tooltip";
import FacilityInformation from "../impact-dashboard/FacilityInformation";
import MitigationInformation from "../impact-dashboard/MitigationInformation";
import useModel from "../impact-dashboard/useModel";
import { updateFacilityRtData } from "../infection-model/rt";
import RtTimeseries from "../rt-timeseries";
import AddCasesModal from "./AddCasesModal";
import { FacilityContext } from "./FacilityContext";
import FacilityProjections from "./FacilityProjections";
import HistoricalCasesChart from "./HistoricalCasesChart";
import LocaleInformationSection from "./LocaleInformationSection";
import { Facility } from "./types";

const ButtonSection = styled.div`
  margin-top: 30px;
`;

const DescRow = styled.div`
  display: flex;
  justify-content: space-between;
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

const RtChartContainer = styled.div``;

const AddCasesRow = styled.div`
  margin-bottom: 16px;
`;

const ImgDuplicate = styled.img`
  display: inline-block;
  height: 10px;
  margin-right: 1em;
  width: 10px;
  vertical-align: baseline;
`;

const AddCasesButton = styled.button`
  color: ${Colors.green};
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  line-height: 1.3;
`;

const FacilityInputForm = (props: { scenarioId: string }) => {
  const history = useHistory();
  const { scenarioId } = props;
  const { facility: initialFacility, rtData, dispatchRtData } = useContext(
    FacilityContext,
  );
  const [facility, updateFacility] = useState(initialFacility);
  const [facilityName, setFacilityName] = useState(facility?.name || undefined);
  const [description, setDescription] = useState(
    facility?.description || undefined,
  );
  const [systemType, setSystemType] = useState(
    facility?.systemType || undefined,
  );
  const model = useModel();

  const save = () => {
    if (facilityName) {
      // Set observedAt to right now when updating a facility from this input form
      const modelUpdate = Object.assign({}, model[0]);
      modelUpdate.observedAt = new Date();

      saveFacility(scenarioId, {
        id: facility?.id,
        name: facilityName || null,
        description: description || null,
        systemType: systemType || null,
        modelInputs: modelUpdate,
      }).then(() => {
        history.push(`/app/scenario/${scenarioId}`);
      });
    } else {
      window.scroll({ top: 0, left: 0, behavior: "smooth" });
    }
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
    if (facility?.id) {
      await deleteFacility(scenarioId, facility.id);
      window.history.back();
    }
    updateShowDeleteModal(false);
  };

  const onModalSave = (newFacility: Facility) => {
    updateFacility(newFacility);
    updateFacilityRtData(newFacility, dispatchRtData);
  };

  return (
    <PageContainer>
      <Column width={"45%"}>
        <InputName
          name={facilityName}
          setName={setFacilityName}
          placeholderValue="Unnamed Facility"
          placeholderText="Facility name is required"
          maxLengthValue={124}
          requiredFlag={true}
          border
        />
        <Spacer y={20} />
        {facility && (
          <AddCasesRow>
            <AddCasesModal
              facility={facility}
              trigger={
                <Tooltip content="Click to add new or previous day cases">
                  <AddCasesButton>
                    <ImgDuplicate alt="" src={iconDuplicatePath} />
                    Add or update cases
                  </AddCasesButton>
                </Tooltip>
              }
              onSave={onModalSave}
            />
          </AddCasesRow>
        )}
        <DescRow>
          <InputDescription
            description={description}
            setDescription={setDescription}
            placeholderValue="Enter a description (optional)"
          />
          <Spacer x={20} />
          <PopUpMenu items={popupItems} />
        </DescRow>

        {facility && (
          <HistoricalCasesChart facility={facility} onModalSave={onModalSave} />
        )}
        <Spacer y={20} />

        {facility && (
          <RtChartContainer>
            <RtTimeseries
              facility={facility}
              data={rtData ? rtData[facility.id] : undefined}
            />
          </RtChartContainer>
        )}

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
      </Column>
      <Column width={"55%"}>
        <FacilityProjections />
      </Column>

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
    </PageContainer>
  );
};

export default FacilityInputForm;
