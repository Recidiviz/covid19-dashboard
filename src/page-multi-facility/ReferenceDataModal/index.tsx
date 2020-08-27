import { invert, pickBy } from "lodash";
import React from "react";
import styled from "styled-components";

import { referenceFacilitiesProp, saveScenario } from "../../database";
import Colors from "../../design-system/Colors";
import { StyledButton } from "../../design-system/InputButton";
import ModalDialog from "../../design-system/ModalDialog";
import { TitleProps } from "../../design-system/ModalTitle";
import { useFacilities } from "../../facilities-context";
import useRejectionToast from "../../hooks/useRejectionToast";
import useScenario from "../../scenario-context/useScenario";
import { Facility, ReferenceFacility } from "../types";
import { ADD_NEW_FACILITY, SKIP } from "./shared";

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: normal;
  margin-top: 20px;
`;

const SaveButton = styled(StyledButton)`
  font-size: 14px;
  font-weight: normal;
  background-color: ${(props) =>
    props.disabled ? Colors.opacityGray : Colors.forest};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
`;

const CancelButton = styled(StyledButton)`
  background: transparent;
  color: ${Colors.forest};
  font-family: "Libre Franklin";
  font-size: 14px;
  line-height: 26px;
`;

const ModalFooter = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin-top: 20px;
  padding-bottom: 35px;
`;

interface Props {
  open: boolean;
  title: TitleProps["title"];
  selections: { [key in ReferenceFacility["id"]]: Facility["id"] };
  cancelText: string | undefined;
  children: React.ReactElement;
  onClose: () => void;
  closeModal?: () => void;
  saveType: "update" | "replace";
  useReferenceDataToggleValue?: boolean;
}

const ReferenceDataModal: React.FC<Props> = ({
  selections,
  open,
  onClose,
  title,
  cancelText,
  children,
  saveType,
  closeModal,
  useReferenceDataToggleValue,
}) => {
  const rejectionToast = useRejectionToast();
  const [scenarioState, dispatchScenarioUpdate] = useScenario();
  const scenario = scenarioState.data;
  const {
    actions: { createUserFacilitiesFromReferences },
    state: { referenceFacilities },
  } = useFacilities();

  async function handleClose() {
    rejectionToast(
      saveScenario({
        ...scenario,
        referenceDataObservedAt: new Date(),
      }).then((savedScenario) => {
        if (savedScenario) dispatchScenarioUpdate(savedScenario);
      }),
    );
    onClose();
  }

  async function handleSave() {
    const facilitiesToCreate = Object.keys(
      pickBy(selections, (facilityId) => facilityId === ADD_NEW_FACILITY),
    );

    rejectionToast(
      createUserFacilitiesFromReferences(
        facilitiesToCreate.map((id) => referenceFacilities[id]),
        scenario,
      )
        .then((newFacilitiesMapping) => {
          return saveScenario({
            ...scenario,
            ...{ useReferenceData: useReferenceDataToggleValue },
            referenceDataObservedAt: new Date(),
            [referenceFacilitiesProp]: Object.assign(
              {},
              saveType === "update" ? scenario?.[referenceFacilitiesProp] : {},
              newFacilitiesMapping,
              invert(
                pickBy(
                  selections,
                  (facilityId) =>
                    facilityId !== ADD_NEW_FACILITY && facilityId !== SKIP,
                ),
              ),
            ),
          });
        })
        .then((savedScenario) => {
          if (savedScenario) dispatchScenarioUpdate(savedScenario);
        }),
    );
    onClose();
  }

  return (
    <ModalDialog
      width="650px"
      open={open}
      title={title}
      closeModal={closeModal}
    >
      <ModalContent>{children}</ModalContent>
      <ModalFooter>
        {cancelText && (
          <CancelButton onClick={handleClose}>{cancelText}</CancelButton>
        )}
        <SaveButton onClick={handleSave}>Save</SaveButton>
      </ModalFooter>
    </ModalDialog>
  );
};

export default ReferenceDataModal;
