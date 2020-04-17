import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { getFacilities } from "../database";
import Loading from "../design-system/Loading";
import SiteHeader from "../site-header/SiteHeader";
import AddFacilityModal from "./AddFacilityModal";
import { FacilityContext } from "./FacilityContext";
import FacilityRow from "./FacilityRow";
import ProjectionsHeader from "./ProjectionsHeader";
import ScenarioSidebar from "./ScenarioSidebar";
import { Facilities } from "./types";

const MultiFacilityPageDiv = styled.div``;

const MultiFacilityImpactDashboard = styled.main.attrs({
  className: `
    h-screen
    flex
    mt-8
  `,
})``;

const MultiFacilityPage: React.FC = () => {
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

  return (
    <MultiFacilityPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          <MultiFacilityImpactDashboard>
            <ScenarioSidebar />
            <div className="flex flex-col flex-1 pb-6 pl-8">
              <AddFacilityModal />
              <ProjectionsHeader />
              {facilities.loading ? (
                <Loading />
              ) : (
                facilities?.data.map((facility, index) => {
                  return (
                    <FacilityContext.Provider key={index} value={facility}>
                      <FacilityRow />
                    </FacilityContext.Provider>
                  );
                })
              )}
            </div>
          </MultiFacilityImpactDashboard>
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
