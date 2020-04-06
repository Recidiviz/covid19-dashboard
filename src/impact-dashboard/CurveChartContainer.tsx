import { calculateCurves } from "../infection-model";
import { MarkColors } from "./ChartArea";
import CurveChart from "./CurveChart";
import { useEpidemicModelState } from "./EpidemicModelContext";

interface Props {
  markColors: MarkColors;
}

const CurveChartContainer: React.FC<Props> = ({ markColors }) => {
  const modelData = useEpidemicModelState();

  return (
    <>
      {modelData.countyLevelDataLoading ? (
        <div>Loading...</div>
      ) : (
        <CurveChart
          curveData={calculateCurves(modelData)}
          hospitalBeds={
            modelData.countyLevelData
              ?.get(modelData.stateCode)
              // we don't show this until data is loaded so it will always be a number
              ?.get(modelData.countyName)?.hospitalBeds as number
          }
          markColors={markColors}
        />
      )}
    </>
  );
};

export default CurveChartContainer;
