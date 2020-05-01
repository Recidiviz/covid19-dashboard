import { navigate } from "gatsby";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";

import { getFacilities } from "../database";
import Colors from "../design-system/Colors";
import iconAddSrc from "../design-system/icons/ic_add.svg";
import Loading from "../design-system/Loading";
import { useFlag } from "../feature-flags";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { getRtDataForFacility } from "../infection-model/rt";
import { useLocaleDataState } from "../locale-data-context";
import useScenario from "../scenario-context/useScenario";
import { FacilityContext } from "./FacilityContext";
import FacilityRow from "./FacilityRow";
import ProjectionsHeader from "./ProjectionsHeader";
import ScenarioSidebar from "./ScenarioSidebar";
import { Facilities } from "./types";

const MultiFacilityImpactDashboardContainer = styled.main.attrs({
  className: `
    flex
    mt-8
  `,
})``;

const AddFacilityButton = styled.button`
  color: ${Colors.forest};
  cursor: pointer;
  font-family: "Libre Baskerville", serif;
  font-size: 24px;
  line-height: 1.2;
  text-align: left;
`;

const IconAdd = styled.img`
  display: inline;
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

const AddFacilityButtonText = styled.span`
  vertical-align: middle;
`;

const MultiFacilityImpactDashboard: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const [scenario] = useScenario();

  const { setFacility, rtData, dispatchRtData } = useContext(FacilityContext);
  const useRt = useFlag(["useRt"]);

  const [facilities, setFacilities] = useState({
    data: [] as Facilities,
    loading: true,
  });

  async function fetchFacilities() {
    if (!scenario?.data?.id) return;

    const facilitiesData = await getFacilities(scenario.data.id);

    if (facilitiesData) {
      setFacilities({
        data: facilitiesData,
        loading: false,
      });
    }
  }

  useEffect(() => {
    fetchFacilities();
  }, [scenario.data?.id]);

  useEffect(
    () => {
      if (useRt) {
        facilities.data.forEach(async (facility) => {
          // don't fetch data if we already have it
          if (rtData && rtData[facility.id]) return;

          const facilityRtData = await getRtDataForFacility(facility);
          dispatchRtData({
            type: "add",
            payload: { [facility.id]: facilityRtData },
          });
        });
      }
    },
    // omitting dispatchRtData because it's not a stable reference,
    // due to being initialized inside SiteProvider.
    // TODO: may change as part of #163
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [facilities.data, useRt],
  );

  const openAddFacilityPage = () => {
    setFacility(null);
    navigate("/facility");
  };

  return (
    <MultiFacilityImpactDashboardContainer>
      {scenario.loading ? (
        <Loading />
      ) : (
        <ScenarioSidebar numFacilities={facilities?.data.length} />
      )}
      <div className="flex flex-col flex-1 pb-6 pl-8">
        <AddFacilityButton onClick={openAddFacilityPage}>
          <IconAdd alt="add facility" src={iconAddSrc} />
          <AddFacilityButtonText>Add Facility</AddFacilityButtonText>
        </AddFacilityButton>
        <ProjectionsHeader />
        {facilities.loading ? (
          <Loading />
        ) : (
          facilities?.data.map((facility) => {
            return (
              <EpidemicModelProvider
                key={facility.id}
                facilityModel={facility.modelInputs}
                localeDataSource={localeDataSource}
              >
                <FacilityRow
                  facility={facility}
                  scenarioId={facility.scenarioId}
                />
              </EpidemicModelProvider>
            );
          })
        )}
      </div>
    </MultiFacilityImpactDashboardContainer>
  );
};

export default MultiFacilityImpactDashboard;
