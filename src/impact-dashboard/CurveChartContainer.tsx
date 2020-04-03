import { calculateCurves } from "../infection-model";
import { useEpidemicModelState } from "./EpidemicModelContext";

const CurveChart = require("./CurveChart").default as any;
const {
  populationAndHospitalData,
} = require("../page-overview/assets/dataSource") as any;

const CurveChartContainer: React.FC = () => {
  const modelData = useEpidemicModelState();
  return (
    <CurveChart
      curveData={calculateCurves(modelData)}
      hospitalBeds={populationAndHospitalData[modelData.stateCode].hospitalBeds}
    />
  );
};

export default CurveChartContainer;
