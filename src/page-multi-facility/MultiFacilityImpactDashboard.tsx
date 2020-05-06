import { navigate } from "gatsby";
import React, { useContext, useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import styled from "styled-components";

import { getFacilities } from "../database";
import Colors from "../design-system/Colors";
import iconAddSrc from "../design-system/icons/ic_add.svg";
import Loading from "../design-system/Loading";
import TextLabel from "../design-system/TextLabel";
import { useFlag } from "../feature-flags";
import useFacilitiesRtData from "../hooks/useFacilitiesRtData";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
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

const ScenarioTabs = styled.div`
  .react-tabs {
    &__tab-list {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      cursor: pointer;
    }
    &__tab {
      opacity: 0.7;
      margin: 0 0 0 32px;
      &--selected {
        opacity: 1;
        border-bottom: 4px solid ${Colors.teal};
        padding-bottom: 1.5rem;
      }
    }
  }
`;

const ScenarioPanelsDiv = styled.div`
  .panel-shown {
    display: block;
  }
  .panel-hidden {
    display: none;
  }
`;

interface ScenarioPanelsProps {
  selectedTabIndex: number;
}

// This is necessary so we don't reload the tab details while switching tabs
// since that makes the UI slow.
const ScenarioPanels: React.FC<ScenarioPanelsProps> = (props) => {
  const panelChildren = React.Children.toArray(props.children).map(
    (child, i) => (
      <div
        key={i}
        className={props.selectedTabIndex == i ? "panel-shown" : "panel-hidden"}
      >
        {child}
      </div>
    ),
  );
  return <ScenarioPanelsDiv>{panelChildren}</ScenarioPanelsDiv>;
};

const MultiFacilityImpactDashboard: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const [scenario] = useScenario();

  const { setFacility } = useContext(FacilityContext);
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

  useFacilitiesRtData(facilities.data, useRt);

  const openAddFacilityPage = () => {
    setFacility(null);
    navigate("/facility");
  };

  const [selectedTab, setSelectedTab] = useState(0);

  const projectionsPanel = (
    <>
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
              <FacilityRow facility={facility} />
            </EpidemicModelProvider>
          );
        })
      )}
    </>
  );

  const rateOfSpreadPanel = <> </>;
  const showRateOfSpreadTab = useFlag(["showRateOfSpreadTab"]);
  return (
    <MultiFacilityImpactDashboardContainer>
      {scenario.loading ? (
        <Loading />
      ) : (
        <ScenarioSidebar numFacilities={facilities?.data.length} />
      )}
      <div className="flex flex-col flex-1 pb-6 pl-8 justify-start">
        <div className="flex flex-row flex-none justify-between items-start">
          <AddFacilityButton onClick={openAddFacilityPage}>
            <IconAdd alt="add facility" src={iconAddSrc} />
            <AddFacilityButtonText>Add Facility</AddFacilityButtonText>
          </AddFacilityButton>
          <ScenarioTabs>
            <Tabs selectedIndex={selectedTab} onSelect={setSelectedTab}>
              <TabList>
                <Tab>
                  <TextLabel padding={false}>Projections</TextLabel>
                </Tab>
                {showRateOfSpreadTab ? (
                  <Tab>
                    <TextLabel padding={false}>Rate of spread</TextLabel>
                  </Tab>
                ) : null}
              </TabList>
              <TabPanel />
              {showRateOfSpreadTab ? <TabPanel /> : null}
            </Tabs>
          </ScenarioTabs>
        </div>
        <ScenarioPanels selectedTabIndex={selectedTab}>
          {projectionsPanel}
          {rateOfSpreadPanel}
        </ScenarioPanels>
      </div>
    </MultiFacilityImpactDashboardContainer>
  );
};

export default MultiFacilityImpactDashboard;
