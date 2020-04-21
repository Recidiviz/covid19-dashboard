import { sum, zip } from "d3-array";
import isEmpty from "lodash/isEmpty";
import { useEffect, useState } from "react";

import Loading from "../design-system/Loading";
import { calculateCurves, CurveData } from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";
import { MarkColors } from "./ChartArea";
import CurveChart from "./CurveChart";
import { useEpidemicModelState } from "./EpidemicModelContext";

interface Props {
  chartHeight?: number;
  markColors: MarkColors;
  groupStatus: Record<string, any>;
}

interface ChartData {
  [key: string]: number[];
}

// for these curves we combine incarcerated and staff
function combinePopulations(data: CurveData, compartment: seirIndex) {
  return zip(
    getAllValues(getColView(data.incarcerated, compartment)),
    getAllValues(getColView(data.staff, compartment)),
  ).map((values) => sum(values));
}

// some curves are an aggregate of several compartments
function combineCompartments(data: CurveData, compartments: seirIndex[]) {
  return zip(
    ...compartments.map((compartment) => combinePopulations(data, compartment)),
  ).map((values) => sum(values));
}
const CurveChartContainer: React.FC<Props> = ({
  markColors,
  groupStatus,
  chartHeight,
}) => {
  const modelData = useEpidemicModelState();
  const [curveData, updateCurveData] = useState({} as ChartData);
  const [curveDataFiltered, setCurveDataFiltered] = useState({} as ChartData);

  useEffect(() => {
    // TODO: could this be stored on the context instead for reuse?
    const projectionData = calculateCurves(modelData);
    // merge and filter the curve data to only what we need for the chart
    updateCurveData({
      exposed: combinePopulations(projectionData, seirIndex.exposed),
      fatalities: combinePopulations(projectionData, seirIndex.fatalities),
      hospitalized: combineCompartments(projectionData, [
        seirIndex.hospitalized,
        seirIndex.icu,
        seirIndex.hospitalRecovery,
      ]),
      infectious: combinePopulations(projectionData, seirIndex.infectious),
    });
  }, [modelData]);

  useEffect(() => {
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
    <Loading />
  ) : (
    <CurveChart
      chartHeight={chartHeight}
      curveData={curveDataFiltered}
      hospitalBeds={modelData.hospitalBeds}
      markColors={markColors}
    />
  );
};

export default CurveChartContainer;
