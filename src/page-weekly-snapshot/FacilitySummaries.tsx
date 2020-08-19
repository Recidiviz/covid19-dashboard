import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { getFacilitiesRtDataById } from "../infection-model/rt";
import { useLocaleDataState } from "../locale-data-context";
import FacilityPage from "./FacilityPage";

const FacilitySummariesContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
`;

const FacilityRow = styled.div`
  padding: 20px 0;
`;

const FacilitySummaries: React.FC = () => {
  const localeState = useLocaleDataState();
  const {
    state: { loading, facilities: facilitiesState, rtData },
  } = useFacilities();
  const facilities = Object.values(facilitiesState);
  const facilitiesRtData = getFacilitiesRtDataById(rtData, facilities);
  return (
    <FacilitySummariesContainer>
      {loading ? (
        <Loading />
      ) : (
        facilities.map((facility) => (
          <FacilityRow key={facility.id}>
            <EpidemicModelProvider
              facilityModel={facility.modelInputs}
              localeDataSource={localeState.data}
            >
              <FacilityPage
                facility={facility}
                rtData={facilitiesRtData && facilitiesRtData[facility.id]}
              />
            </EpidemicModelProvider>
          </FacilityRow>
        ))
      )}
    </FacilitySummariesContainer>
  );
};

export default FacilitySummaries;
