import { startOfDay, startOfToday } from "date-fns";
import hexAlpha from "hex-alpha";
import { pick } from "lodash";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { getFacilityModelVersions, saveFacility } from "../database";
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
import { Facility, ModelInputs } from "../page-multi-facility/types";

export type Props = Pick<ModalProps, "trigger"> & {
  facility: Facility;
  updateFacility: Function;
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
  facilityModelVersions: ModelInputs[];
}) =>
  facilityModelVersions.find(
    ({ observedAt }) => date.toDateString() === observedAt.toDateString(),
  );

// Create a diff of the model to store changes in the update cases modal.
// This is necessary so that we don't update the current model if the modal is thrown away w/o saving or
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

  const [facilityModelVersions, setFacilityModelVersions] = useState<
    ModelInputs[] | undefined
  >();

  useEffect(() => {
    async function getModelVersions() {
      const modelVersions = await getFacilityModelVersions({
        facilityId: facility.id,
        scenarioId: facility.scenarioId,
        distinctByObservedAt: true,
      });
      setFacilityModelVersions(modelVersions);
    }
    getModelVersions();
  });

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
          tileClassName={getTileClassName}
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
