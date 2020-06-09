import { navigate } from "gatsby";
import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import iconDuplicatePath from "../design-system/icons/ic_duplicate.svg";
import InputButton, { StyledButton } from "../design-system/InputButton";
import InputDescription from "../design-system/InputDescription";
import InputName from "../design-system/InputName";
import ModalDialog from "../design-system/ModalDialog";
import { Column, PageContainer } from "../design-system/PageColumn";
import PopUpMenu from "../design-system/PopUpMenu";
import { Spacer } from "../design-system/Spacer";
import { useToasts } from "../design-system/Toast";
import Tooltip from "../design-system/Tooltip";
import { useFacilities } from "../facilities-context";
import useRejectionToast from "../hooks/useRejectionToast";
import useScreenWidth from "../hooks/useScreenWidth";
import FacilityInformation from "../impact-dashboard/FacilityInformation";
import MitigationInformation from "../impact-dashboard/MitigationInformation";
import useModel from "../impact-dashboard/useModel";
import RtTimeseries from "../rt-timeseries";
import AddCasesModal from "./AddCasesModal";
import FacilityProjections from "./FacilityProjections";
import HistoricalCasesChart from "./HistoricalCasesChart";
import LocaleInformationSection from "./LocaleInformationSection";
import { Facility, ModelInputs, RtDataMapping } from "./types";

interface ButtonSectionProps {
  screenWidth: number;
}

const ButtonSection = styled.div<ButtonSectionProps>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: ${Colors.slate};
  z-index: 1;
  margin-left: ${({ screenWidth }) =>
    screenWidth > 1280 ? (screenWidth - 1280) / 2 : 0}px;
`;

const PageContainerWithBottomMargin = styled(PageContainer)`
  margin-bottom: 60px;
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

const PageHeaderContainer = styled.div`
  padding-right: 20px;
`;

interface Props {
  scenarioId: string;
  facility: Facility | undefined;
  rtData: RtDataMapping;
}

const FacilityInputForm: React.FC<Props> = ({
  rtData,
  facility,
  scenarioId,
}) => {
  const { addToast } = useToasts();
  const {
    actions: {
      createOrUpdateFacility,
      removeFacility: deleteFacility,
      duplicateFacility,
      deselectFacility,
      selectFacility,
      fetchFacilityRtData,
    },
  } = useFacilities();
  const [facilityName, setFacilityName] = useState(facility?.name);
  const [description, setDescription] = useState(facility?.description);
  const [systemType, setSystemType] = useState(
    facility?.systemType || undefined,
  );
  const model = useModel();

  const rejectionToast = useRejectionToast();

  const screenWidth = useScreenWidth();

  const onSave = () => {
    // Set observedAt to right now when updating a facility from this input form
    const modelUpdate = Object.assign({}, model[0]) as ModelInputs;
    modelUpdate.observedAt = new Date();

    if (facilityName) {
      rejectionToast(
        createOrUpdateFacility(scenarioId, {
          id: facility?.id,
          name: facilityName,
          description: description || null,
          systemType: systemType || null,
          modelInputs: modelUpdate,
        }).then(() => {
          deselectFacility();
          navigate("/");
        }),
      );
    } else {
      window.scroll({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const onDuplicateFacility = async () => {
    if (facility) {
      await rejectionToast(
        duplicateFacility(scenarioId, facility).then((duplicatedFacility) => {
          if (duplicatedFacility) {
            selectFacility(duplicatedFacility.id);
            addToast("Facility successfully duplicated");
          }
        }),
      );
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

  const popupItems = [
    { name: "Duplicate", onClick: onDuplicateFacility },
    { name: "Delete", onClick: openDeleteModal },
  ];
  const removeFacility = async () => {
    const facilityId = facility?.id;
    if (facilityId) {
      await rejectionToast(deleteFacility(scenarioId, facilityId));
      deselectFacility();
      window.history.back();
    }
    updateShowDeleteModal(false);
  };

  const onModalSave = (newFacility: Facility) => {
    createOrUpdateFacility(scenarioId, newFacility);
    fetchFacilityRtData(newFacility);
  };

  return (
    <>
      <PageHeaderContainer>
        <div className="mx-5">
          <InputName
            name={facility?.name || facilityName}
            setName={setFacilityName}
            placeholderValue="Unnamed Facility"
            placeholderText="Facility name is required"
            maxLengthValue={124}
            requiredFlag={true}
            styles={{ paddingBottom: "8px" }}
          />
        </div>
        {facility && (
          <div className="flex justify-end">
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
            <Spacer x={20} />
            <PopUpMenu items={popupItems} />
          </div>
        )}
      </PageHeaderContainer>
      <PageContainerWithBottomMargin>
        <Column width={"45%"} borderTop>
          <Spacer y={14} />
          <DescRow>
            <InputDescription
              description={facility?.description || undefined}
              setDescription={setDescription}
              placeholderValue="Enter a description (optional)"
            />
          </DescRow>
          {facility && (
            <HistoricalCasesChart
              facility={facility}
              onModalSave={onModalSave}
            />
          )}
          <Spacer y={20} />
          {facility && (
            <RtChartContainer>
              <RtTimeseries
                facility={facility}
                onModalSave={onModalSave}
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
          <ButtonSection className="pl-8" screenWidth={screenWidth}>
            <InputButton label="Save" onClick={onSave} />
          </ButtonSection>
          <div className="mt-8" />
        </Column>
        <Column width={"55%"} borderTop>
          <Spacer y={14} />
          <FacilityProjections facility={facility} />
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
              <DeleteButton label="Delete facility" onClick={removeFacility}>
                Delete facility
              </DeleteButton>
              <CancelButton onClick={closeDeleteModal}>Cancel</CancelButton>
            </ModalButtons>
          </ModalContents>
        </ModalDialog>
      </PageContainerWithBottomMargin>
    </>
  );
};

export default FacilityInputForm;
