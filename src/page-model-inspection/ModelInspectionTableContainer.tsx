import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import { calculateAllCurves } from "../infection-model";
import ModelInspectionTable from "./ModelInspectionTable";

const ModelInspectionTableContainer: React.FC = () => {
  const modelData = useEpidemicModelState();
  return <ModelInspectionTable data={calculateAllCurves(modelData)} />;
};

export default ModelInspectionTableContainer;
