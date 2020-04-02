import { EpidemicModelProvider } from "./EpidemicModelContext";
import ImpactDashboard from "./ImpactDashboard";

const ImpactDashboardContainer: React.FC = () => {
  return (
    <EpidemicModelProvider>
      <ImpactDashboard />
    </EpidemicModelProvider>
  );
};

export default ImpactDashboardContainer;
