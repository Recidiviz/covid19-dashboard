import classNames from "classnames";
import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import styled from "styled-components";

import Colors, { MarkColors as markColors } from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import FontSizes from "../design-system/FontSizes";
import iconEditSrc from "../design-system/icons/ic_edit.svg";
import { Spacer } from "../design-system/Spacer";
import Tooltip from "../design-system/Tooltip";
import CurveChartContainer from "../impact-dashboard/CurveChartContainer";
import {
  totalConfirmedCases,
  totalIncarceratedPopulation,
} from "../impact-dashboard/EpidemicModelContext";
import useModel from "../impact-dashboard/useModel";
import { getNewestRt, isRtData, RtData, RtError } from "../infection-model/rt";
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

const FacilityRowDiv = styled.div``;

const FacilityNameLabel = styled.label`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 100%;
  padding-right: 25px;
  padding-left: 15px;
  width: 75%;
`;

const DataContainer = styled.div`
  border-color: ${Colors.opacityGray};
`;

const CaseText = styled.div`
  color: ${Colors.darkRed};
`;

const PopulationText = styled.div`
  color: ${Colors.forest};
`;

const FacilityName = styled.label`
  color: ${Colors.forest};
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  font-weight: 400;
`;

const IconEdit = styled.img`
  flex: 0 0 auto;
  height: 16px;
  margin-left: 10px;
  width: 16px;
  visibility: hidden;

  ${FacilityRowDiv}.hover & {
    visibility: visible;
  }
`;

interface Props {
  facility: Facility;
  facilityRtData: RtData | RtError | undefined;
  onSave: (f: Facility) => void;
}

const FacilityRow: React.FC<Props> = ({ facility, facilityRtData, onSave }) => {
  const [model] = useModel();

  const latestRt = isRtData(facilityRtData)
    ? getNewestRt(facilityRtData.Rt)?.value
    : facilityRtData;

  const chartData = useChartDataFromProjectionData(
    useProjectionData(model, true, facilityRtData),
  );

  // UI hover states are a little complicated;
  // the entire row is a click target to navigate to the Facility page,
  // but there can be sub-targets that do other stuff (e.g. open a modal).
  // if we're on a sub-target we want to suppress the row's overall hover UI state.
  const [rowHover, setRowHover] = useState(false);
  const showHover = () => setRowHover(true);
  const hideHover = () => setRowHover(false);

  const { name, updatedAt } = facility;
  const confirmedCases = totalConfirmedCases(model);
  const population = totalIncarceratedPopulation(model);

  const openFacilityPage = () => {
    navigate("/facility");
  };

  return (
    <FacilityRowDiv
      onClick={openFacilityPage}
      onMouseOver={showHover}
      onMouseOut={hideHover}
      className={classNames("cursor-pointer", { hover: rowHover })}
    >
      <DataContainer className="flex flex-row mb-8 border-b">
        <div className="w-2/5 flex flex-col justify-between">
          <div className="flex flex-row h-full">
            <div className="w-1/5 font-bold flex justify-start">
              <div
                // prevent interaction with children from triggering a row click
                onClick={(e) => e.stopPropagation()}
                // suppress row hover UI state
                onMouseOver={(e) => {
                  e.stopPropagation();
                  hideHover();
                }}
              >
                <AddCasesModal
                  facility={facility}
                  trigger={
                    <Tooltip
                      content={
                        <div>Click to add new or previous day cases</div>
                      }
                    >
                      <CaseText className="hover:underline">
                        {confirmedCases}
                      </CaseText>
                    </Tooltip>
                  }
                  onSave={onSave}
                />
              </div>
            </div>
            <div className="w-1/4 font-bold flex justify-start">
              <div
                // prevent interaction with children from triggering a row click
                onClick={(e) => e.stopPropagation()}
                // suppress row hover UI state
                onMouseOver={(e) => {
                  e.stopPropagation();
                  hideHover();
                }}
              >
                <AddCasesModal
                  facility={facility}
                  trigger={
                    <Tooltip
                      content={
                        <div>Click to add new or previous day cases</div>
                      }
                    >
                      <PopulationText className="hover:underline">
                        {population}
                      </PopulationText>
                    </Tooltip>
                  }
                  onSave={onSave}
                />
              </div>
            </div>
            <FacilityNameLabel>
              <FacilityName>{name}</FacilityName>
              <IconEdit alt="" src={iconEditSrc} />
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
            addAnnotations={false}
          />
        </div>
      </DataContainer>
    </FacilityRowDiv>
  );
};

export default FacilityRow;
