import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
// import { useFacilities } from "../facilities-context";
// import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
// import { getFacilitiesRtDataById } from "../infection-model/rt";
import { useLocaleDataState } from "../locale-data-context";
import useScenario from "../scenario-context/useScenario";

const SystemWideProjectionChartContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
`;

const SystemWideProjectionChart: React.FC = () => {
  // const { data: localeDataSource } = useLocaleDataState();
  const [scenario] = useScenario();
  // const { state: facilitiesState } = useFacilities();
  // const facilities = Object.values(facilitiesState.facilities);
  // const rtData = getFacilitiesRtDataById(facilitiesState.rtData, facilities);

  return (
    <SystemWideProjectionChartContainer>
      {scenario.loading ? (
        <Loading />
      ) : (
        <div>System-Wide Projection for Facilities with Active Cases</div>
      )}
    </SystemWideProjectionChartContainer>
  );
};

export default SystemWideProjectionChart;
