import { startOfDay, startOfToday } from "date-fns";
import hexAlpha from "hex-alpha";
import { pick } from "lodash";
import React, { useState } from "react";
import styled from "styled-components";

import { saveFacility } from "../database";
import Colors from "../design-system/Colors";
import InputButton from "../design-system/InputButton";
import InputDate from "../design-system/InputDate";
import Modal, { Props as ModalProps } from "../design-system/Modal";
import useFacilityModelVersions from "../hooks/useFacilityModelVersions";
import {
  ModelInputsPopulationBrackets,
  populationBracketKeys,
} from "../impact-dashboard/EpidemicModelContext";
import { AgeGroupGrid } from "../impact-dashboard/FacilityInformation";
import useModel from "../impact-dashboard/useModel";
import { Facility, ModelInputs } from "./types";

export type Props = Pick<ModalProps, "trigger"> & {
  facility: Facility;
  updateFacility: (f: Facility) => void;
};

const noDataColor = Colors.darkRed;

const ModalContents = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  font-weight: normal;
  justify-content: flex-start;
  margin-top: 30px;

  .add-cases-calendar__day--no-data {
    background: ${hexAlpha(noDataColor, 0.2)};

    &.react-calendar__tile--now {
      background: ${hexAlpha(noDataColor, 0.1)};
    }

    &.react-calendar__tile--active {
      background: ${hexAlpha(noDataColor, 0.4)};
    }

    &:hover {
      background: ${hexAlpha(noDataColor, 0.5)};
      color: ${Colors.white};
    }
  }
`;

const HorizRule = styled.div`
  border-bottom: 0.5px solid ${Colors.darkGray};
  padding-bottom: 20px;
  margin-bottom: 20px;
  width: 100%;
`;

const findMatchingDay = ({
  date,
  facilityModelVersions,
}: {
  date: Date;
  facilityModelVersions?: ModelInputs[];
}) =>
  facilityModelVersions?.find(
    ({ observedAt }) => date.toDateString() === observedAt.toDateString(),
  );

const AddCasesModal: React.FC<Props> = ({
  facility,
  trigger,
  updateFacility,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  // the current state of the facility is the default when we need to reset
  const defaultInputs = pick(facility.modelInputs, populationBracketKeys);
  const defaultObservationDate = facility.modelInputs.observedAt;

  const [inputs, setInputs] = useState<ModelInputsPopulationBrackets>(
    defaultInputs,
  );
  const [observationDate, setObservationDate] = useState(
    defaultObservationDate,
  );
  const [facilityModelVersions, updateModelVersions] = useFacilityModelVersions(
    facility,
  );

  const updateInputs = (update: ModelInputsPopulationBrackets) => {
    setInputs({ ...inputs, ...update });
  };

  const resetModalData = () => {
    setInputs(defaultInputs);
    setObservationDate(defaultObservationDate);
  };

  const [, updateModel] = useModel();

  const save = async () => {
    const newInputs = {
      ...facility.modelInputs,
      ...inputs,
      observedAt: observationDate,
    };
    // Update the local state iff
    // The observedAt date in the modal is more recent than the observedAt date in the current modelInputs.
    // This needs to happen so that facility data will show the most updated data w/o requiring a hard reload.
    if (
      defaultObservationDate &&
      observationDate &&
      startOfDay(observationDate) >= startOfDay(defaultObservationDate)
    ) {
      updateFacility({
        ...facility,
        modelInputs: newInputs,
      });
      // sending the full input object into the model context may trigger side effects
      // such as a full reset, so just send the inputs that are editable
      // in this dialog
      updateModel({ ...inputs, observedAt: observationDate });
    }
    setModalOpen(false);

    // Save to DB with model changes
    await saveFacility(facility.scenarioId, {
      id: facility.id,
      modelInputs: newInputs,
    });
    updateModelVersions();
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    const now = new Date();
    if (view === "month" && facilityModelVersions !== undefined) {
      if (date <= now && !findMatchingDay({ facilityModelVersions, date })) {
        return `add-cases-calendar__day--no-data`;
      }
    }
    return null;
  };

  return (
    <Modal
      modalTitle="Add Cases"
      onClose={resetModalData}
      open={modalOpen}
      setOpen={setModalOpen}
      trigger={trigger}
    >
      <ModalContents>
        <InputDate
          labelAbove={"Date observed"}
          onValueChange={(date) => {
            if (date) {
              setObservationDate(date);
              const inputsForDate = findMatchingDay({
                date,
                facilityModelVersions,
              });
              if (inputsForDate) {
                setInputs(pick(inputsForDate, populationBracketKeys));
              } else {
                setInputs({ ...defaultInputs });
              }
            }
          }}
          tileClassName={getTileClassName}
          valueEntered={observationDate || startOfToday()}
        />
        <HorizRule />
        <AgeGroupGrid
          model={inputs}
          updateModel={updateInputs}
          collapsible={true}
        />
        <HorizRule />
        <InputButton label="Save" onClick={save} />
      </ModalContents>
    </Modal>
  );
};

export default AddCasesModal;
