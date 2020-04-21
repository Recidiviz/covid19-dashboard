import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import ModelInspectionPage from "./ModelInspectionPage";

const ModelInspectionPageContainer: React.FC = () => {
  return (
    <EpidemicModelProvider localeDataSource={useLocaleDataState().data}>
      <ModelInspectionPage />
    </EpidemicModelProvider>
  );
};

export default ModelInspectionPageContainer;
