import { startOfDay, startOfToday } from "date-fns";
import hexAlpha from "hex-alpha";
import { pick } from "lodash";
import numeral from "numeral";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { saveFacility } from "../database";
import Colors from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import InputButton from "../design-system/InputButton";
import InputDate from "../design-system/InputDate";
import Modal, { Props as ModalProps } from "../design-system/Modal";
import Tooltip from "../design-system/Tooltip";
import useFacilityModelVersions from "../hooks/useFacilityModelVersions";
import {
  getTotalPopulation,
  ModelInputsPopulationBrackets,
  populationBracketKeys,
  totalConfirmedCases,
} from "../impact-dashboard/EpidemicModelContext";
import { AgeGroupGrid } from "../impact-dashboard/FacilityInformation";
import useModel from "../impact-dashboard/useModel";
import { Facility, ModelInputs } from "./types";

export type Props = Pick<ModalProps, "trigger"> & {
  facility: Facility;
  onSave: (f: Facility) => void;
};

const noDataColor = Colors.darkRed;

const ModalContents = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  font-weight: normal;
  justify-content: flex-start;
  margin-top: 30px;

  .react-calendar__tile {
    /* these are needed for tooltip display */
    position: relative;
    overflow: visible !important; /* needed to override an inline style */
  }

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

const CalendarTileTooltipAnchor = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const TooltipContents = styled.div`
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  min-width: 80px;
`;

const TooltipData = styled.div`
  margin-bottom: 0.5em;
  width: 150px;
`;

const TooltipDate = styled.div`
  font-size: 11px;
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

const formatPopulation = (n: number) => numeral(n).format("0,0");

const AddCasesModal: React.FC<Props> = ({ facility, trigger, onSave }) => {
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
    // After the DB is updated, then process the onSave callback
    onSave({ ...facility, modelInputs: newInputs });
  };

  const getTileClassName = useCallback(
    ({ date, view }: { date: Date; view: string }) => {
      const now = new Date();
      if (view === "month" && facilityModelVersions !== undefined) {
        if (
          date <= now &&
          // don't complain about dates before the first day of data for this facility
          date >= facilityModelVersions[0].observedAt &&
          !findMatchingDay({ facilityModelVersions, date })
        ) {
          return `add-cases-calendar__day--no-data`;
        }
      }
      return null;
    },
    [facilityModelVersions],
  );

  const renderTooltip = useCallback(
    ({ date }: { date: Date }) => {
      const now = new Date();
      const matchingDay = findMatchingDay({ facilityModelVersions, date });
      return (
        <Tooltip
          content={
            <TooltipContents>
              {date <= now &&
              facilityModelVersions &&
              date >= facilityModelVersions[0].observedAt ? (
                <TooltipData>
                  {matchingDay ? (
                    <span>
                      {formatPopulation(totalConfirmedCases(matchingDay))} cases
                      <br />
                      {formatPopulation(getTotalPopulation(matchingDay))}{" "}
                      residents and staff
                    </span>
                  ) : (
                    "Missing case and population data"
                  )}
                </TooltipData>
              ) : null}
              <TooltipDate>
                <DateMMMMdyyyy date={date} />
              </TooltipDate>
            </TooltipContents>
          }
        >
          <CalendarTileTooltipAnchor />
        </Tooltip>
      );
    },
    [facilityModelVersions],
  );

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
          tileContent={renderTooltip}
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
