import { startOfToday } from "date-fns";
import React from "react";

import ModalDialog from "../../design-system/ModalDialog";
import useAddCasesInputs from "../../hooks/useAddCasesInputs";
import AddCasesModalContent from "../AddCasesModal/AddCasesModalContent";
import { Facility } from "../types";

interface Props {
  facility: Facility;
  open: boolean;
  setOpen: (open: boolean) => void;
  observedAt: Date | undefined;
  setObservedAt: (date: Date | undefined) => void;
  onModalSave: (f: Facility) => void;
}

const HistoricalAddCasesModal: React.FC<Props> = ({
  facility,
  open,
  setOpen,
  observedAt,
  setObservedAt,
  onModalSave,
}) => {
  const {
    inputs,
    observationDate,
    facilityModelVersions,
    updateInputs,
    resetModalData,
    saveCases,
    isReference,
  } = useAddCasesInputs(facility, onModalSave, observedAt);

  async function handleSave() {
    await saveCases();
    setOpen(false);
  }

  return (
    <ModalDialog
      title="Add Historical Data"
      closeModal={() => {
        resetModalData();
        setOpen(false);
      }}
      open={open}
    >
      <AddCasesModalContent
        observationDate={observationDate || startOfToday()}
        onValueChange={setObservedAt}
        inputs={inputs}
        updateInputs={updateInputs}
        onSave={handleSave}
        facilityModelVersions={facilityModelVersions}
        isReference={isReference}
      />
    </ModalDialog>
  );
};

export default HistoricalAddCasesModal;
