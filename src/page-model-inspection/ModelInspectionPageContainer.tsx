import React from "react";

import Loading from "../components/design-system/Loading";
import { EpidemicModelProvider } from "../components/impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../contexts/locale-data-context";
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
