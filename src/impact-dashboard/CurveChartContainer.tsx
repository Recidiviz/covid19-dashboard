// @ts-nocheck
import { zip } from "d3-array";
import { useEffect, useState } from "react";

import Loading from "../design-system/Loading";
import { calculateCurves, CurveData } from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";
import { MarkColors } from "./ChartArea";
import CurveChart from "./CurveChart";
import { useEpidemicModelState } from "./EpidemicModelContext";

interface Props {
  markColors: MarkColors;
  groupStatus: Record<string, any>;
}

// for these curves we combine incarcerated and staff
function combinePopulations(data: CurveData, columnIndex: number) {
  return zip(
    getAllValues(getColView(data.incarcerated, columnIndex)),
    getAllValues(getColView(data.staff, columnIndex)),
  ).map(([incarcerated, staff]) => incarcerated + staff);
}
const CurveChartContainer: React.FC<Props> = ({ markColors, groupStatus }) => {
  const modelData = useEpidemicModelState();
  // TODO: could this be stored on the context instead for reuse?
  const projectionData = calculateCurves(modelData);
  // merge and filter the curve data to only what we need for the chart
  const curveData = {
    exposed: combinePopulations(projectionData, seirIndex.exposed),
    fatalities: combinePopulations(projectionData, seirIndex.fatalities),
    hospitalized: combinePopulations(projectionData, seirIndex.hospitalized),
    infectious: combinePopulations(projectionData, seirIndex.infectious),
  };

  const [displayData, setDisplayData] = useState({});

  const updateDisplayData = () => {
    let filteredGroupStatus = Object.keys(groupStatus).filter(
      (groupName) => groupStatus[groupName],
    );

    setDisplayData(
      filteredGroupStatus.reduce(
        (data, key) => Object.assign(data, { [key]: curveData[key] }),
        {},
      ),
    );
  };

  useEffect(() => {
    updateDisplayData();
  }, [groupStatus]);

  return modelData.countyLevelDataLoading ? (
    <Loading />
  ) : (
    <CurveChart
      curveData={displayData}
      hospitalBeds={modelData.hospitalBeds}
      markColors={markColors}
    />
  );
};

export default CurveChartContainer;
