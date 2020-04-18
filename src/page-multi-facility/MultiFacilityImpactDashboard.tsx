import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { getFacilities } from "../database";
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

interface MultiFacilityImpactDashboardType = {
  baselineScenario?: object;
}

const MultiFacilityImpactDashboard<MultiFacilityImpactDashboardType>: React.FC = ({ baselineScenario }) => {
  const { data: localeDataSource } = useLocaleDataState();

  const [facilities, setFacilities] = useState({
    data: [] as Facilities,
    loading: true,
  });

  const [scenario, setScenario] = useState({
    data: {},
    loading: true
  })

  useEffect(() => {
    async function fetchScenario () {
      const result = await baselineScenario.data.get();
      setScenario({
        data: result?.data(),
        loading: false
      })
    }

    async function fetchFacilities() {
      const facilitiesData = await getFacilities();

      if (facilitiesData) {
        setFacilities({
          data: facilitiesData,
          loading: false,
        });
      }
    }

    fetchScenario();
    fetchFacilities();
  }, []);

  return (
    <MultiFacilityImpactDashboardContainer>
      <ScenarioSidebar scenario={scenario?.data} />
      <div className="flex flex-col flex-1 pb-6 pl-8">
        <AddFacilityModal />
        <ProjectionsHeader />
        {facilities.loading ? (
          <Loading />
        ) : (
          facilities?.data.map((facility, index) => {
            return (
              <FacilityContext.Provider key={index} value={facility}>
                <EpidemicModelProvider
                  facilityModel={facility.modelInputs}
                  localeDataSource={localeDataSource}
                >
                  <FacilityRow />
                </EpidemicModelProvider>
              </FacilityContext.Provider>
            );
          })
        )}
      </div>
    </MultiFacilityImpactDashboardContainer>
  );
};

export default MultiFacilityImpactDashboard;
