import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import ModelInspectionPage from "./ModelInspectionPage";

const ModelInspectionPageContainer: React.FC = () => {
  return (
    <EpidemicModelProvider>
      <ModelInspectionPage />
    </EpidemicModelProvider>
  );
};

export default ModelInspectionPageContainer;
