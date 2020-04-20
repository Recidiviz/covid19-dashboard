import { sum, zip } from "d3-array";

import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import { calculateCurves, CurveData } from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex, seirIndexList } from "../infection-model/seir";
import ModelOutputChart from "./ModelOutputChart";

// for these curves we combine incarcerated and staff
function combinePopulations(data: CurveData, compartment: seirIndex) {
  return zip(
    getAllValues(getColView(data.incarcerated, compartment)),
    getAllValues(getColView(data.staff, compartment)),
  ).map((values) => sum(values));
}

const ModelOutputChartContainer: React.FC = () => {
  const modelData = useEpidemicModelState();
  // TODO: could this be stored on the context instead for reuse?
  const projectionData = calculateCurves(modelData);
  // merge and filter the curve data to only what we need for the chart
  const curveData: { [key: string]: number[] } = {};
  seirIndexList.forEach((i) => {
    curveData[seirIndex[i]] = combinePopulations(projectionData, i);
  });

  return (
    <ModelOutputChart
      curveData={curveData}
      hospitalBeds={modelData.hospitalBeds}
    />
  );
};

export default ModelOutputChartContainer;
