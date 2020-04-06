import { calculateCurves } from "../infection-model";
import { MarkColors } from "./ChartArea";
import CurveChart from "./CurveChart";
import { useEpidemicModelState } from "./EpidemicModelContext";

const {
  populationAndHospitalData,
} = require("../page-overview/assets/dataSource") as any;

interface Props {
  markColors: MarkColors;
}

const CurveChartContainer: React.FC<Props> = ({ markColors }) => {
  const modelData = useEpidemicModelState();
  return (
    <CurveChart
      curveData={calculateCurves(modelData)}
      hospitalBeds={populationAndHospitalData[modelData.stateCode].hospitalBeds}
      markColors={markColors}
    />
  );
};

export default CurveChartContainer;
