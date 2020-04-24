import React from "react";

import Loading from "../design-system/Loading";
import { useLocaleDataState } from "../locale-data-context";
import { EpidemicModelProvider } from "./EpidemicModelContext";
import ImpactDashboard from "./ImpactDashboard";

const ImpactDashboardContainer: React.FC = () => {
  const { data, loading: localeDataLoading } = useLocaleDataState();

  return localeDataLoading ? (
    <Loading />
  ) : (
    <EpidemicModelProvider localeDataSource={data}>
      <ImpactDashboard />
    </EpidemicModelProvider>
  );
};

export default ImpactDashboardContainer;
