import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { getFacilitiesRtDataById } from "../infection-model/rt";
import { useLocaleDataState } from "../locale-data-context";
import useScenario from "../scenario-context/useScenario";
import FacilitySummaryRow from "./FacilitySummaryRow";

const FacilitySummariesContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
`;

const FacilityRow = styled.div`
  padding: 20px;
`;

const FacilitySummaries: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const [scenario] = useScenario();
  const { state: facilitiesState } = useFacilities();
  const facilities = Object.values(facilitiesState.facilities);
  const rtData = getFacilitiesRtDataById(facilitiesState.rtData, facilities);

  return (
    <FacilitySummariesContainer>
      {scenario.loading || facilitiesState.loading ? (
        <Loading />
      ) : (
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
