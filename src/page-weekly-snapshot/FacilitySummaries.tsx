import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { getFacilitiesRtDataById } from "../infection-model/rt";
import { LocaleData } from "../locale-data-context";
import { Facilities, RtDataMapping } from "../page-multi-facility/types";
import FacilityPage from "./FacilityPage";

const FacilitySummariesContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
`;

const FacilityRow = styled.div`
  padding: 20px 0;
`;

interface Props {
  localeData: LocaleData;
  loading: boolean;
  rtData: RtDataMapping;
  facilities: Facilities;
}

const FacilitySummaries: React.FC<Props> = ({
  localeData,
  loading,
  rtData,
  facilities,
}) => {
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
              localeDataSource={localeData}
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
