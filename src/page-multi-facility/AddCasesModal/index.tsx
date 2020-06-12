import React, { useState } from "react";

import Modal, { Props as ModalProps } from "../../design-system/Modal";
import useAddCasesInputs from "../../hooks/useAddCasesInputs";
import { Facility } from "../types";
import AddCasesModalContent from "./AddCasesModalContent";

export type Props = Pick<ModalProps, "trigger"> & {
  facility: Facility;
  onSave: (f: Facility) => void;
};

const AddCasesModal: React.FC<Props> = ({ facility, trigger, onSave }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [observedAt, setObservedAt] = useState<Date | undefined>();
  const {
    inputs,
    observationDate,
    facilityModelVersions,
    updateInputs,
    resetModalData,
    saveCases,
  } = useAddCasesInputs(facility, onSave, observedAt);

  async function handleSave() {
    await saveCases();
    setModalOpen(false);
  }

  return (
    <Modal
      modalTitle="Add Historical Data"
      onClose={resetModalData}
      open={modalOpen}
      setOpen={setModalOpen}
      trigger={trigger}
    >
      <AddCasesModalContent
        observationDate={observationDate}
        onValueChange={setObservedAt}
        inputs={inputs}
        updateInputs={updateInputs}
        onSave={handleSave}
        facilityModelVersions={facilityModelVersions}
      />
    </Modal>
  );
};

export default AddCasesModal;
