import { startOfDay, startOfToday } from "date-fns";
import { pick } from "lodash";
import React, { useState } from "react";
import { useToasts } from "react-toast-notifications";
import styled from "styled-components";

import { saveFacility } from "../database";
import Colors from "../design-system/Colors";
import InputButton from "../design-system/InputButton";
import InputDate from "../design-system/InputDate";
import Modal, { Props as ModalProps } from "../design-system/Modal";
import {
  EpidemicModelUpdate,
  persistedKeys,
} from "../impact-dashboard/EpidemicModelContext";
import { AgeGroupGrid } from "../impact-dashboard/FacilityInformation";
import useModel from "../impact-dashboard/useModel";
import { Facility } from "./types";

type Props = Pick<ModalProps, "trigger"> & {
  facility: Facility;
  updateFacility: Function;
};

const ModalContents = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  font-weight: normal;
  justify-content: flex-start;
  margin-top: 30px;
`;

const HorizRule = styled.div`
  border-bottom: 0.5px solid ${Colors.darkGray};
  padding-bottom: 20px;
  margin-bottom: 20px;
  width: 100%;
`;


// Create a diff of the model to store changes in the update cases modal.
// This is necessary so that we don't update the current modal if the modal is thrown away w/o saving or
// if the date added in the modal is prior to the current date (backfill)
const useModelDiff = (): [
  EpidemicModelUpdate,
  (update: EpidemicModelUpdate) => void,
  () => void,
] => {
  const [diff, setDiff] = useState({});
  const mergeDiff = (update: EpidemicModelUpdate) => {
    setDiff({ ...diff, ...update });
  };
  const resetDiff = () => {
    setDiff({});
  };
  return [diff, mergeDiff, resetDiff];
};

const AddCasesModal: React.FC<Props> = ({
  facility,
  trigger,
  updateFacility,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const [model, updateModel] = useModel();
  let [modelDiff, fakeUpdateModel, resetModelDiff] = useModelDiff();
  const newModel = { ...model, ...modelDiff };
  const { addToast } = useToasts();

  const save = () => {
    // Ensure that we don't insert keys (like `localeDataSource`) that is in model but not in the facility modelInputs
    const modelInputs = {
      ...facility.modelInputs,
      ...pick(newModel, persistedKeys),
    };
    // Update the local state iff
    // The observedAt date in the modal is more recent than the observedAt date in the current modelInputs.
    // This needs to happen so that facility data will show the most updated data w/o requiring a hard reload.
    if (
      newModel.observedAt &&
      model.observedAt &&
      startOfDay(newModel.observedAt) >= startOfDay(model.observedAt)
    ) {
      updateFacility({ ...facility, modelInputs });
      updateModel(modelDiff);
    }
    // Save to DB with model changes
    saveFacility(facility.scenarioId, {
      id: facility.id,
      modelInputs,
    });
    setModalOpen(false);
    // Custom ID to identify the toast to support dismiss
    let utcTimeString = new Date().getTime().toString();
    addToast("Data successfully saved!", {
      autoDismiss: true,
      autoDismissTimeout: 10000,
      id: utcTimeString,
      customId: utcTimeString
    });
  };

  return (
    <Modal
      modalTitle="Add Cases"
      onClose={resetModelDiff}
      open={modalOpen}
      setOpen={setModalOpen}
      trigger={trigger}
    >
      <ModalContents>
        <InputDate
          labelAbove={"Date observed"}
          onValueChange={(date) => {
            if (date) {
              fakeUpdateModel({ observedAt: date });
            }
          }}
          valueEntered={newModel.observedAt || startOfToday()}
        />
        <HorizRule />
        <AgeGroupGrid
          model={newModel}
          updateModel={fakeUpdateModel}
          collapsible={true}
        />
        <HorizRule />
        <InputButton label="Save" onClick={save} />
      </ModalContents>
    </Modal>
  );
};

export default AddCasesModal;
