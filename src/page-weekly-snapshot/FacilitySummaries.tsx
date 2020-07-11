import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { getFacilitiesRtDataById } from "../infection-model/rt";
import { useLocaleDataState } from "../locale-data-context";
import FacilitySummaryRow from "./FacilitySummaryRow";
import { useWeeklyReport } from "./weekly-report-context";

const FacilitySummariesContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
`;

const FacilityRow = styled.div`
  padding: 20px;
`;

const FacilitySummaries: React.FC = () => {
  const {
    data: localeDataSource,
    loading: localeLoading,
  } = useLocaleDataState();
  const { state: facilitiesState } = useFacilities();
  const {
    state: { scenario, loading: scenarioLoading },
  } = useWeeklyReport();
  const facilities = Object.values(facilitiesState.facilities);
  const rtData = getFacilitiesRtDataById(facilitiesState.rtData, facilities);

  return (
    <FacilitySummariesContainer>
      {scenarioLoading || localeLoading ? (
        <Loading />
      ) : (
        scenario &&
        facilities.map((facility) => (
          <FacilityRow key={facility.id}>
            <EpidemicModelProvider
              facilityModel={facility.modelInputs}
              localeDataSource={localeDataSource}
            >
              <FacilitySummaryRow
                facility={facility}
                rtData={rtData && rtData[facility.id]}
              />
            </EpidemicModelProvider>
          </FacilityRow>
        ))
      )}
    </FacilitySummariesContainer>
  );
};

export default FacilitySummaries;
