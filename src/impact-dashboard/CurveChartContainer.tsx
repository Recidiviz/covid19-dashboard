import isEmpty from "lodash/isEmpty";
import React from "react";
import { useEffect, useState } from "react";
import BounceLoader from "react-spinners/BounceLoader";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { MarkColors } from "./ChartArea";
import CurveChart, { ChartData } from "./CurveChart";
import { useEpidemicModelState } from "./EpidemicModelContext";

const LoadingContainerCustom = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 177px;
  padding-bottom: 32px;
`;

interface Props {
  chartHeight?: number;
  groupStatus: Record<string, any>;
  hideAxes?: boolean;
  markColors: MarkColors;
  curveData?: ChartData;
  addAnnotations?: boolean;
}

const CurveChartContainer: React.FC<Props> = ({
  markColors,
  groupStatus,
  chartHeight,
  hideAxes,
  curveData,
  addAnnotations = true,
}) => {
  const { hospitalBeds } = useEpidemicModelState();
  const [curveDataFiltered, setCurveDataFiltered] = useState(curveData);

  useEffect(() => {
    if (!curveData) return;

    if (isEmpty(curveData)) {
      setCurveDataFiltered({});
      return;
    }

    let filteredGroupStatus = Object.keys(groupStatus).filter(
      (groupName) => groupStatus[groupName],
    );

    setCurveDataFiltered(
      filteredGroupStatus.reduce(
        (data, key) => Object.assign(data, { [key]: curveData[key] }),
        {},
      ),
    );
  }, [groupStatus, curveData]);

  return !curveDataFiltered ? (
    <LoadingContainerCustom>
      <BounceLoader size={60} color={Colors.forest} />
    </LoadingContainerCustom>
  ) : (
    <CurveChart
      chartHeight={chartHeight}
      curveData={curveDataFiltered}
      hospitalBeds={hospitalBeds}
      markColors={markColors}
      hideAxes={hideAxes}
      addAnnotations={addAnnotations}
    />
  );
};

export default CurveChartContainer;
