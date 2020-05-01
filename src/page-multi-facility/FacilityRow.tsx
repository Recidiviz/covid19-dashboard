import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import styled from "styled-components";

import { saveFacility } from "../database/index";
import Colors, { MarkColors as markColors } from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import InputDescription from "../design-system/InputDescription";
import CurveChartContainer from "../impact-dashboard/CurveChartContainer";
import {
  totalConfirmedCases,
  useEpidemicModelState,
} from "../impact-dashboard/EpidemicModelContext";
import { FacilityContext } from "./FacilityContext";
import { useChartDataFromUserInput } from "./projectionCurveHooks";
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
  const modelData = useEpidemicModelState();
  const { setFacility } = useContext(FacilityContext);
  const [facility, updateFacility] = useState(initialFacility);
  const chartData = useChartDataFromUserInput(modelData);

  const { id, name, updatedAt } = facility;
  const confirmedCases = totalConfirmedCases(modelData);

  const openFacilityPage = () => {
    setFacility(facility);
    navigate("/facility");
  };

  return (
    <div onClick={openFacilityPage} className="cursor-pointer">
      <DataContainer className="flex flex-row mb-8 border-b">
        <div className="w-2/5 flex flex-col justify-between">
          <div className="flex flex-row h-full">
            <CaseText className="w-1/4 font-bold">{confirmedCases}</CaseText>
            <FacilityNameLabel onClick={handleSubClick()}>
              <InputDescription
                description={name}
                setDescription={(name) => {
                  const newName = (name || "").replace(/(\r\n|\n|\r)/gm, "");
                  // this updates the local state
                  updateFacility({ ...facility, name: newName });
                  // this persists the changes to the database
                  saveFacility(scenarioId, {
                    id,
                    name: newName,
                  });
                }}
                placeholderValue="Unnamed Facility"
              />
            </FacilityNameLabel>
          </div>
          <div className="text-xs text-gray-500 pb-4">
            <div>
              Last Update: <DateMMMMdyyyy date={updatedAt} />
            </div>
            <div className="mr-8" />
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
  );
};

export default FacilityRow;
