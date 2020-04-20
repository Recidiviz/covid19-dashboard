import Loading from "../design-system/Loading";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import ModelInspectionPage from "./ModelInspectionPage";

const ModelInspectionPageContainer: React.FC = () => {
  const { data, loading: localeDataLoading } = useLocaleDataState();

  return localeDataLoading ? (
    <Loading />
  ) : (
    <EpidemicModelProvider localeDataSource={data}>
      <ModelInspectionPage />
    </EpidemicModelProvider>
  );
};

export default ModelInspectionPageContainer;
