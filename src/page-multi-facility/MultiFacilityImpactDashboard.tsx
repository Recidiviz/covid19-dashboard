import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { getFacilities } from "../database";
import Colors from "../design-system/Colors";
import Loading from "../design-system/Loading";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import AddFacilityModal from "./AddFacilityModal";
import { FacilityContext } from "./FacilityContext";
import FacilityRow from "./FacilityRow";
import ProjectionsHeader from "./ProjectionsHeader";
import ScenarioSidebar from "./ScenarioSidebar";
import { Facilities } from "./types";

const MultiFacilityImpactDashboardContainer = styled.main.attrs({
  className: `
    h-screen
    flex
    mt-8
  `,
})``;

const AddFacilityButton = styled.button`
  color: ${Colors.green};
  cursor: pointer;
  font-family: "Libre Baskerville", serif;
  font-size: 32px;
  line-height: 32px;
  letter-spacing: -0.03em;
  text-align: left;
`;

const MultiFacilityImpactDashboard: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const history = useHistory();
  const { setFacility } = useContext(FacilityContext);

  const [facilities, setFacilities] = useState({
    data: [] as Facilities,
    loading: true,
  });

  useEffect(() => {
    async function fetchFacilities() {
      const facilitiesData = await getFacilities();

      if (facilitiesData) {
        setFacilities({
          data: facilitiesData,
          loading: false,
        });
      }
    }
    fetchFacilities();
  }, []);

  const openAddFacilityPage = (event: React.MouseEvent<HTMLElement>) => {
    setFacility(null);
    history.push("/multi-facility/facility");
  };

  return (
    <MultiFacilityImpactDashboardContainer>
      <ScenarioSidebar />
      <div className="flex flex-col flex-1 pb-6 pl-8">
        <AddFacilityButton onClick={openAddFacilityPage}>
          + Add Facility
        </AddFacilityButton>
        <ProjectionsHeader />
        {facilities.loading ? (
          <Loading />
        ) : (
          facilities?.data.map((facility, index) => {
            return (
              <EpidemicModelProvider
                key={index}
                facilityModel={facility.modelInputs}
                localeDataSource={localeDataSource}
              >
                <FacilityRow facility={facility} />
              </EpidemicModelProvider>
            );
          })
        )}
      </div>
    </MultiFacilityImpactDashboardContainer>
  );
};

export default MultiFacilityImpactDashboard;
