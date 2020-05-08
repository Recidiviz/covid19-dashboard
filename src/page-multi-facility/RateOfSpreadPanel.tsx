import classNames from "classnames";
import React, { useState } from "react";
import styled from "styled-components";

import { FetchedFacilities } from "../constants";
import Loading from "../design-system/Loading";
import RtComparisonChart from "../rt-comparison-chart";
import PanelHeader, { PanelHeaderText } from "./PanelHeader";

const SpreadContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const DataButtons = styled.div`
  display: flex;
  flex-direction: row;
`;

const DataButton = styled(PanelHeaderText)`
  margin-left: 2em;
  opacity: 0.4;

  &.RtDataButton--active {
    opacity: 0.7;
  }
`;

const RateOfSpreadPanel: React.FC<{ facilities: FetchedFacilities }> = ({
  facilities,
}) => {
  const [rtDaysOffset, updateRtDaysOffset] = useState<0 | 1 | 7>(0);

  return (
    <>
      <PanelHeader>
        <SpreadContent>
          <PanelHeaderText>Sorted by Rt</PanelHeaderText>
          <DataButtons>
            <DataButton
              as="button"
              className={classNames({
                "RtDataButton--active": rtDaysOffset === 7,
              })}
              onClick={() => updateRtDaysOffset(7)}
            >
              Last Week
            </DataButton>
            <DataButton
              as="button"
              className={classNames({
                "RtDataButton--active": rtDaysOffset === 1,
              })}
              onClick={() => updateRtDaysOffset(1)}
            >
              Yesterday
            </DataButton>
            <DataButton
              as="button"
              className={classNames({
                "RtDataButton--active": rtDaysOffset === 0,
              })}
              onClick={() => updateRtDaysOffset(0)}
            >
              Current
            </DataButton>
          </DataButtons>
        </SpreadContent>
      </PanelHeader>
      {facilities.loading ? (
        <Loading />
      ) : (
        <RtComparisonChart
          facilities={facilities.data}
          rtDaysOffset={rtDaysOffset}
        />
      )}
    </>
  );
};

export default RateOfSpreadPanel;
