import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import styled from "styled-components";

import { saveFacility } from "../database/index";
import Colors, { MarkColors as markColors } from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import FontSizes from "../design-system/FontSizes";
import InputDescription from "../design-system/InputDescription";
import { Spacer } from "../design-system/Spacer";
import { useFlag } from "../feature-flags";
import CurveChartContainer from "../impact-dashboard/CurveChartContainer";
import { totalConfirmedCases } from "../impact-dashboard/EpidemicModelContext";
import useModel from "../impact-dashboard/useModel";
import AddCasesModal from "./AddCasesModal";
import { FacilityContext } from "./FacilityContext";
import FacilityRowRtValuePill from "./FacilityRowRtValuePill";
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

const LastUpdatedLabel = styled.div`
  color: ${Colors.forest50};
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: ${FontSizes.Charts.labelText}px;
  line-height: 16px;
`;

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

const FacilityRow: React.FC<Props> = ({
  facility: initialFacility,
  scenarioId: scenarioId,
}) => {
  const [model] = useModel();

  const { rtData, setFacility } = useContext(FacilityContext);

  const [facility, updateFacility] = useState(initialFacility);
  let useRt,
    facilityRtData = undefined,
    latestRt = undefined;
  if (useFlag(["useRt"])) {
    useRt = true;
    facilityRtData = rtData ? rtData[facility.id] : undefined;

    // TODO(Lenny): Update this with the helper function once PR #273 is completed.
    latestRt = facilityRtData?.Rt[facilityRtData.Rt.length - 1].value;
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

  return (
    <>
      <div onClick={openFacilityPage} className="cursor-pointer">
        <DataContainer className="flex flex-row mb-8 border-b">
          <div className="w-2/5 flex flex-col justify-between">
            <div className="flex flex-row h-full">
              <div
                className="w-1/4 font-bold"
                onClick={(e) => e.stopPropagation()}
              >
                <AddCasesModal
                  facility={facility}
                  trigger={<CaseText>{confirmedCases}</CaseText>}
                  updateFacility={updateFacility}
                />
              </div>
              <FacilityNameLabel onClick={handleSubClick()}>
                <InputDescription
                  description={name}
                  setDescription={(name) => {
                    if (name) {
                      const newName = (name || "").replace(
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
              <LastUpdatedLabel>
                Last Update: <DateMMMMdyyyy date={updatedAt} />
              </LastUpdatedLabel>
              <Spacer x={32} />
            </div>
          </div>
          <div className="w-3/5 relative">
            {facilityRtData !== undefined && (
              <FacilityRowRtValuePill latestRt={latestRt} />
            )}
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
    </>
  );
};

export default FacilityRow;
