import { startOfToday } from "date-fns";
import React from "react";

import ModalDialog from "../../components/design-system/ModalDialog";
import useAddCasesInputs from "../../hooks/useAddCasesInputs";
import AddCasesModalContent from "../AddCasesModal/AddCasesModalContent";
import { Facility } from "../types";

interface Props {
  facility: Facility;
  open: boolean;
  setOpen: (open: boolean) => void;
  observedAt: Date | undefined;
  onModalSave: (f: Facility) => void;
}

const HistoricalAddCasesModal: React.FC<Props> = ({
  facility,
  open,
  setOpen,
  observedAt,
  onModalSave,
}) => {
  const {
    inputs,
    observationDate,
    onDateChange,
    facilityModelVersions,
    updateInputs,
    resetModalData,
    saveCases,
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
        onValueChange={onDateChange}
        inputs={inputs}
        updateInputs={updateInputs}
        onSave={handleSave}
        facilityModelVersions={facilityModelVersions}
      />
    </ModalDialog>
  );
};

export default HistoricalAddCasesModal;
