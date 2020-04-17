import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { getFacilities } from "../database";
import Loading from "../design-system/Loading";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
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

  const {
    data: localeDataSource,
    failed: localeDataFailed,
    loading: localeDataLoading,
  } = useLocaleDataState();

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
            {localeDataFailed ? (
              // TODO: real error state
              <div>
                Unable to load state and county data. Please try refreshing the
                page.
              </div>
            ) : localeDataLoading ? (
              <Loading />
            ) : (
              <>
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
              </>
            )}
          </MultiFacilityImpactDashboard>
        </div>
      </div>
    </MultiFacilityPageDiv>
  );
};

export default MultiFacilityPage;
