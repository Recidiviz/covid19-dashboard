import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import SiteHeader from "../site-header/SiteHeader";
import AddFacilityModal from "./AddFacilityModal";

import { getFacilities } from "../database";

import FacilityRow from "./FacilityRow";
import ProjectionsHeader from "./ProjectionsHeader";
import ScenarioSidebar from "./ScenarioSidebar";

import { Facility  } from "./types"

const MultiFacilityPageDiv = styled.div``;

const MultiFacilityImpactDashboard = styled.main.attrs({
  className: `
    h-screen
    flex
    mt-8
  `,
})``;

const MultiFacilityPage: React.FC = () => {
  const [facilities, setFacilities] =
    useState({ data: [] as Array<Facility>, loading: true });

  useEffect(() => {
    async function fetchFacilities() {
      const facilitiesData = await getFacilities() as Array<Facility>;

      setFacilities({
        data: facilitiesData,
        loading: false
      });
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
              { facilities.loading ? <Loading /> :
                facilities.data.map((facility, index) => {
                  return <FacilityRow key={index} facility={facility} />
                })
              }
            </div>
          </MultiFacilityImpactDashboard>
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
