import { navigate } from "gatsby";
import { pick } from "lodash";
import React, { useContext, useState } from "react";
import styled from "styled-components";

import { dateToTimestamp, saveFacility } from "../database/index";
import Colors, { MarkColors as markColors } from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import iconEditSrc from "../design-system/icons/ic_edit.svg";
import InputDate from "../design-system/InputDate";
import InputTextArea from "../design-system/InputTextArea";
import ModalDialog from "../design-system/ModalDialog";
import CurveChartContainer from "../impact-dashboard/CurveChartContainer";
import {
  EpidemicModelUpdate,
  persistedKeys as facilityModelKeys,
  totalConfirmedCases,
} from "../impact-dashboard/EpidemicModelContext";
import { AgeGroupGrid } from "../impact-dashboard/FacilityInformation";
import useModel from "../impact-dashboard/useModel";
import { FacilityContext } from "./FacilityContext";
import { Facility } from "./types";

const groupStatus = {
  exposed: true,
  fatalities: true,
  hospitalized: true,
  infectious: true,
};

const FacilityNameLabel = styled.label`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 100%;
  padding-right: 25px;
  width: 75%;
`;

const IconEdit = styled.img`
  align-self: flex-start;
  flex: 0 0 auto;
  height: 10px;
  margin-left: 10px;
  visibility: hidden;
  width: 10px;
  ${FacilityNameLabel}:hover & {
    visibility: visible;
  }
`;

const DataContainer = styled.div`
  border-color: ${Colors.opacityGray};
`;

const CaseText = styled.div`
  color: ${Colors.darkRed};
`;

// Update case counts modal
const ModalContents = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: normal;
  justify-content: flex-start;
  margin-top: 30px;
`;

// TODO: validate the arguments?
const handleSubClick = (fn?: Function, ...args: any[]) => {
  return (event: React.MouseEvent<Element>) => {
    // This is required or else the openFacilityPage onClick will fire
    // since the Delete button lives within the same div that opens the
    // Facility Details page.
    event.stopPropagation();
    if (fn) fn(...args);
  };
};

interface Props {
  facility: Facility;
  scenarioId: string;
}

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

const FacilityRow: React.FC<Props> = ({
  facility: initialFacility,
  scenarioId: scenarioId,
}) => {
  const { setFacility } = useContext(FacilityContext);
  const [facility, updateFacility] = useState(initialFacility);
  const { id, name, updatedAt } = facility;

  const openFacilityPage = () => {
    setFacility(facility);
    navigate("/facility");
  };

  const [model, updateModel] = useModel();

  const confirmedCases = totalConfirmedCases(model);

  let [modelDiff, fakeUpdateModel, resetModelDiff] = useModelDiff();
  const newModel = { ...model, ...modelDiff };

  // Open/close update case counts modal. Saves data on clicking the save button, discards otherwise
  const [caseCountsModal, updateCaseCountsModal] = useState(false);
  const openCaseCountsModal = () => {
    updateCaseCountsModal(true);
  };
  const closeCaseCountsModal = () => {
    // Ensure that we don't insert keys (like `localeDataSource`) that is in model but not in the facility modelInputs
    const modelInputs = pick(newModel, facilityModelKeys);
    updateCaseCountsModal(false);
    // Update the local state iff
    // The observedAt date in the modal is more recent than the observedAt date in the current modelInputs.
    // This needs to happen so that facility data will show the most updated data w/o requiring a hard reload.
    if (
      newModel.observedAt &&
      model.observedAt &&
      newModel.observedAt.toDate() >= model.observedAt.toDate()
    ) {
      updateFacility({ ...facility, modelInputs });
      updateModel(modelDiff);
    }
    // Save to DB with model changes
    saveFacility(scenarioId, {
      id,
      modelInputs,
    });
    resetModelDiff();
  };

  return (
    <>
      <div onClick={openFacilityPage} className="cursor-pointer">
        <DataContainer className="flex flex-row mb-8 border-b">
          <div className="w-2/5 flex flex-col justify-between">
            <div className="flex flex-row h-full">
              <CaseText
                className="w-1/4 font-bold"
                onClick={handleSubClick(openCaseCountsModal)}
              >
                {confirmedCases}
              </CaseText>
              <FacilityNameLabel onClick={handleSubClick()}>
                <InputTextArea
                  inline={true}
                  fillVertical={true}
                  value={name}
                  onChange={(event) => {
                    const newName = (event.target.value || "").replace(
                      /(\r\n|\n|\r)/gm,
                      "",
                    );
                    // this updates the local state
                    updateFacility({ ...facility, name: newName });
                    // this persists the changes to the database
                    saveFacility(scenarioId, {
                      id,
                      name: newName,
                    });
                  }}
                />
                <IconEdit alt="Edit facility name" src={iconEditSrc} />
              </FacilityNameLabel>
            </div>
            <div className="text-xs text-gray-500 pb-4">
              <div>
                Last Update:{" "}
                <DateMMMMdyyyy date={new Date(updatedAt.toDate())} />
              </div>
              <div className="mr-8" />
            </div>
          </div>
          <div className="w-3/5">
            <CurveChartContainer
              chartHeight={144}
              hideAxes={true}
              groupStatus={groupStatus}
              markColors={markColors}
            />
          </div>
        </DataContainer>
      </div>
      <ModalDialog
        closeModal={closeCaseCountsModal}
        open={caseCountsModal}
        title="Add Cases"
      >
        <ModalContents>
          <InputDate
            labelAbove={"Data observed"}
            onValueChange={(date) => {
              if (date) {
                fakeUpdateModel({ observedAt: dateToTimestamp(date) });
              }
            }}
            valueEntered={newModel.observedAt?.toDate() || new Date()}
          />
          <AgeGroupGrid model={newModel} updateModel={fakeUpdateModel} />
        </ModalContents>
      </ModalDialog>
    </>
  );
};

export default FacilityRow;
