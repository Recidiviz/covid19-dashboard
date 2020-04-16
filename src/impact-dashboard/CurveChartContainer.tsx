import { zip } from "d3-array";

import Loading from "../design-system/Loading";
import { CurveData } from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { MarkColors } from "./ChartArea";
import CurveChart from "./CurveChart";
import { useEpidemicModelState } from "./EpidemicModelContext";

interface Props {
  curveData: {
    [propName: string]: number[];
  };
  markColors: MarkColors;
}

// for these curves we combine incarcerated and staff
function combinePopulations(data: CurveData, columnIndex: number) {
  return zip(
    getAllValues(getColView(data.incarcerated, columnIndex)),
    getAllValues(getColView(data.staff, columnIndex)),
  ).map(([incarcerated, staff]) => incarcerated + staff);
}

const CurveChartContainer: React.FC<Props> = ({ markColors, curveData }) => {
  const modelData = useEpidemicModelState();

  return modelData.countyLevelDataLoading ? (
    <Loading />
  ) : (
    <CurveChart
      curveData={curveData}
      hospitalBeds={modelData.hospitalBeds}
      markColors={markColors}
    />
  );
};

export default CurveChartContainer;
