import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import styled from "styled-components";

import { FetchedFacilities } from "../constants/Facilities";
import { Routes } from "../constants/Routes";
import { getFacilities } from "../database";
import Colors from "../design-system/Colors";
import iconAddSrc from "../design-system/icons/ic_add.svg";
import Loading from "../design-system/Loading";
import TextLabel from "../design-system/TextLabel";
import { useFlag } from "../feature-flags";
import { ReplaceUrlParams } from "../helpers/Routing";
import useFacilitiesRtData from "../hooks/useFacilitiesRtData";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import {
  getFacilitiesRtDataById,
  updateFacilityRtData,
} from "../infection-model/rt";
import { useLocaleDataState } from "../locale-data-context";
import useScenario from "../scenario-context/useScenario";
import { FacilityContext } from "./FacilityContext";
import FacilityRow from "./FacilityRow";
import FacilityRowPlaceholder from "./FacilityRowPlaceholder";
import ProjectionsHeader from "./ProjectionsHeader";
import RateOfSpreadPanel from "./RateOfSpreadPanel";
import ScenarioSidebar from "./ScenarioSidebar";
import SystemSummary from "./SystemSummary";
import { Facilities, Facility } from "./types";

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
  letter-spacing: -0.06em;
  line-height: 24px;
  text-align: left;
  padding-bottom: 0.75rem;
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

const ScenarioTabs = styled.div``;

const ScenarioTabList = styled.ul`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  cursor: pointer;
`;

const ScenarioTab = styled.li<{ active?: boolean }>`
  opacity: 0.7;
  margin: 0 0 0 32px;

  ${(props) =>
    props.active
      ? `
    opacity: 1;
    border-bottom: 4px solid ${Colors.teal};
    padding-bottom: 1.5rem;
  `
      : null}
`;

interface ScenarioPanelsProps {
  selectedTabIndex: number;
}

const MultiFacilityImpactDashboard: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const [scenario] = useScenario();
  const { scenarioId: scenarioIdParam } = useParams();
  const location = useLocation();
  const showRateOfSpreadTab = useFlag(["showRateOfSpreadTab"]);
  const { setFacility, rtData, dispatchRtData } = useContext(FacilityContext);

  const [facilities, setFacilities] = useState<FetchedFacilities>({
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

  const handleFacilitySave = (newFacility: Facility) => {
    setFacilities({
      data: facilities.data.map((f) => {
        if (f.id === newFacility.id) return { ...newFacility };
        return { ...f };
      }),
      loading: facilities.loading,
    });
    updateFacilityRtData(newFacility, dispatchRtData);
  };

  useFacilitiesRtData(facilities.data);
  const facilitiesRtData = getFacilitiesRtDataById(rtData, facilities.data);

  const [selectedTab, setSelectedTab] = useState(0);

  if (!scenarioIdParam) {
    return <Loading />;
  }

  const projectionsPanel = (
    <>
      <ProjectionsHeader />
      {facilities.loading || !scenario.data?.id ? (
        <Loading
          styles={{
            minHeight: "100px",
          }}
        />
      ) : (
        facilities?.data.map((facility) => (
          <FacilityRowPlaceholder key={facility.id}>
            <EpidemicModelProvider
              facilityModel={facility.modelInputs}
              localeDataSource={localeDataSource}
            >
              <FacilityRow
                scenarioId={scenarioIdParam}
                facility={facility}
                onSave={handleFacilitySave}
              />
            </EpidemicModelProvider>
          </FacilityRowPlaceholder>
        ))
      )}
    </>
  );

  return (
    <MultiFacilityImpactDashboardContainer>
      {scenario.loading ? (
        <Loading
          styles={{
            marginTop: "20px",
            minHeight: "100px",
          }}
        />
      ) : (
        <ScenarioSidebar numFacilities={facilities?.data.length} />
      )}
      <div className="flex flex-col flex-1 pb-6 pl-8 justify-start">
        {facilitiesRtData && (
          <SystemSummary
            facilities={facilities.data}
            scenarioId={scenario?.data?.id}
            rtData={facilitiesRtData}
          />
        )}
        <div className="flex flex-row flex-none justify-between items-start">
          <Link
            to={ReplaceUrlParams(Routes.Facility.url, { scenarioId: "new" })}
          >
            <AddFacilityButton>
              <IconAdd alt="add facility" src={iconAddSrc} />
              <AddFacilityButtonText>Add Facility</AddFacilityButtonText>
            </AddFacilityButton>
          </Link>
          <ScenarioTabs>
            <ScenarioTabList>
              <ScenarioTab
                active={selectedTab === 0}
                onClick={() => setSelectedTab(0)}
              >
                <TextLabel padding={false}>Projections</TextLabel>
              </ScenarioTab>
              {showRateOfSpreadTab ? (
                <ScenarioTab
                  active={selectedTab === 1}
                  onClick={() => setSelectedTab(1)}
                >
                  <TextLabel padding={false}>Rate of spread</TextLabel>
                </ScenarioTab>
              ) : null}
            </ScenarioTabList>
          </ScenarioTabs>
        </div>
        {selectedTab === 0 && projectionsPanel}
        {selectedTab === 1 && <RateOfSpreadPanel facilities={facilities} />}
      </div>
    </MultiFacilityImpactDashboardContainer>
  );
};

export default MultiFacilityImpactDashboard;
