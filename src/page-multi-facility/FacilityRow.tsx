import { startOfDay, startOfToday } from "date-fns";
import { navigate } from "gatsby";
import { pick } from "lodash";
import React, { useContext, useState } from "react";
import styled from "styled-components";

import { saveFacility } from "../database/index";
import Colors, { MarkColors as markColors } from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import InputButton from "../design-system/InputButton";
import InputDate from "../design-system/InputDate";
import InputDescription from "../design-system/InputDescription";
import ModalDialog from "../design-system/ModalDialog";
import { Spacer } from "../design-system/Spacer";
import { useFlag } from "../feature-flags";
import CurveChartContainer from "../impact-dashboard/CurveChartContainer";
import {
  EpidemicModelUpdate,
  persistedKeys as facilityModelKeys,
  totalConfirmedCases,
} from "../impact-dashboard/EpidemicModelContext";
import { AgeGroupGrid } from "../impact-dashboard/FacilityInformation";
import useModel from "../impact-dashboard/useModel";
import { FacilityContext } from "./FacilityContext";
import {
  useChartDataFromProjectionData,
  useProjectionData,
} from "./projectionCurveHooks";
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

const DataContainer = styled.div`
  border-color: ${Colors.opacityGray};
`;

const CaseText = styled.div`
  color: ${Colors.darkRed};
`;

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
  const [model, updateModel] = useModel();

  const { rtData, setFacility } = useContext(FacilityContext);
  const [facility, updateFacility] = useState(initialFacility);
  let useRt, facilityRtData;
  if (useFlag(["useRt"])) {
    useRt = true;
    facilityRtData = rtData ? rtData[facility.id] : undefined;
  }
  const chartData = useChartDataFromProjectionData(
    useProjectionData(model, useRt, facilityRtData),
  );

  const { id, name, updatedAt } = facility;
  const confirmedCases = totalConfirmedCases(model);

  const openFacilityPage = () => {
    setFacility(facility);
    navigate("/facility");
  };

  let [modelDiff, fakeUpdateModel, resetModelDiff] = useModelDiff();
  const newModel = { ...model, ...modelDiff };

  // Open/close update case counts modal. Saves data on clicking the save button, discards otherwise
  const [caseCountsModal, updateCaseCountsModal] = useState(false);
  const openCaseCountsModal = () => {
    updateCaseCountsModal(true);
  };
  const closeCaseCountsModal = () => {
    resetModelDiff();
    updateCaseCountsModal(false);
  };

  const save = () => {
    // Ensure that we don't insert keys (like `localeDataSource`) that is in model but not in the facility modelInputs
    const modelInputs = {
      ...facility.modelInputs,
      ...pick(newModel, facilityModelKeys),
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
    saveFacility(scenarioId, {
      id,
      modelInputs,
    });
    closeCaseCountsModal();
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
                <InputDescription
                  description={name}
                  setDescription={(name) => {
                    if (name) {
                      const newName = (name || "").replace(/(\r\n|\n|\r)/gm, "");
                      // this updates the local state
                      updateFacility({ ...facility, name: newName });
                      // this persists the changes to the database
                      saveFacility(scenarioId, {
                        id,
                        name: newName,
                      });
                    }
                  }}
                  placeholderValue="Unnamed Facility"
                  placeholderText="Facility name is required"
                  maxLengthValue={124}
                  requiredFlag={true}
                />
              </FacilityNameLabel>
            </div>
            <div className="text-xs text-gray-500 pb-4">
              <div>
                Last Update: <DateMMMMdyyyy date={updatedAt} />
              </div>
              <Spacer x={32} />
            </div>
          </div>
          <div className="w-3/5">
            <CurveChartContainer
              curveData={chartData}
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
            labelAbove={"Date observed"}
            onValueChange={(date) => {
              if (date) {
                fakeUpdateModel({ observedAt: date });
              }
            }}
            valueEntered={newModel.observedAt || startOfToday()}
          />
          <HorizRule />
          <AgeGroupGrid model={newModel} updateModel={fakeUpdateModel} />
          <HorizRule />
          <InputButton label="Save" onClick={save} />
        </ModalContents>
      </ModalDialog>
    </>
  );
};

export default FacilityRow;
