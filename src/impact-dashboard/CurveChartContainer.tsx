import isEmpty from "lodash/isEmpty";
import React from "react";
import { useEffect, useState } from "react";

import { ProjectionColors } from "../design-system/Colors";
import Loading from "../design-system/Loading";
import CurveChart, { ChartData } from "./CurveChart";
import { useEpidemicModelState } from "./EpidemicModelContext";

interface Props {
  chartHeight?: number;
  groupStatus: Record<string, any>;
  hideAxes?: boolean;
  markColors: ProjectionColors;
  curveData?: ChartData;
  addAnnotations?: boolean;
  useHoverAnnotations?: boolean;
}

const CurveChartContainer: React.FC<Props> = ({
  markColors,
  groupStatus,
  chartHeight,
  hideAxes,
  curveData,
  addAnnotations = true,
  useHoverAnnotations = true,
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
    <Loading
      styles={{
        minHeight: "177px",
        paddingBottom: "32px",
      }}
    />
  ) : (
    <CurveChart
      chartHeight={chartHeight}
      curveData={curveDataFiltered}
      hospitalBeds={hospitalBeds}
      markColors={markColors}
      hideAxes={hideAxes}
      addAnnotations={addAnnotations}
      useHoverAnnotations={useHoverAnnotations}
    />
  );
};

export default CurveChartContainer;
