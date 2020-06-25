import { invert, isEmpty } from "lodash";
import React from "react";
import styled from "styled-components";

import { referenceFacilitiesProp, saveScenario } from "../../database";
import Colors from "../../design-system/Colors";
import { StyledButton } from "../../design-system/InputButton";
import ModalDialog from "../../design-system/ModalDialog";
import { TitleProps } from "../../design-system/ModalTitle";
import useRejectionToast from "../../hooks/useRejectionToast";
import useScenario from "../../scenario-context/useScenario";
import { Facility, ReferenceFacility } from "../types";

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: normal;
`;

const SaveButton = styled(StyledButton)`
  font-size: 14px;
  font-weight: normal;
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
`;

interface Props {
  open: boolean;
  title: TitleProps["title"];
  selections: { [key in ReferenceFacility["id"]]: Facility["id"] };
  cancelText: string | undefined;
  children: React.ReactElement;
  onClose: () => void;
}

const ReferenceDataModal: React.FC<Props> = ({
  selections,
  open,
  onClose,
  title,
  cancelText,
  children,
}) => {
  const rejectionToast = useRejectionToast();
  const [scenarioState, dispatchScenarioUpdate] = useScenario();
  const scenario = scenarioState.data;

  async function handleSave() {
    if (Object.keys(selections)) {
      await rejectionToast(
        saveScenario({
          ...scenario,
          [referenceFacilitiesProp]: Object.assign(
            {},
            scenario?.[referenceFacilitiesProp],
            invert(selections),
          ),
        }).then((savedScenario) => {
          if (savedScenario) dispatchScenarioUpdate(savedScenario);
        }),
      );
    }
    onClose();
  }

  return (
    <ModalDialog open={open} title={title}>
      <ModalContent>{children}</ModalContent>
      <ModalFooter>
        {cancelText && (
          <CancelButton onClick={onClose}>{cancelText}</CancelButton>
        )}
        <SaveButton disabled={isEmpty(selections)} onClick={handleSave}>
          Save
        </SaveButton>
      </ModalFooter>
    </ModalDialog>
  );
};

export default ReferenceDataModal;
