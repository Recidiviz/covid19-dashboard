import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { getFacilities, saveScenario } from "../database";
import Colors from "../design-system/Colors";
import Loading from "../design-system/Loading";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import AddFacilityModal from "./AddFacilityModal";
import { FacilityContext } from "./FacilityContext";
import FacilityRow from "./FacilityRow";
import { ScenarioType } from "./MultiFacilityPage";
import ProjectionsHeader from "./ProjectionsHeader";
import ScenarioSidebar from "./ScenarioSidebar";
import { Facilities, Scenario } from "./types";

const MultiFacilityImpactDashboardContainer = styled.main.attrs({
  className: `
    h-screen
    flex
    mt-8
  `,
})``;

interface Props {
  baselineScenario?: ScenarioType;
}

const AddFacilityButton = styled.button`
  color: ${Colors.green};
  cursor: pointer;
  font-family: "Libre Baskerville", serif;
  font-size: 32px;
  line-height: 32px;
  letter-spacing: -0.03em;
  text-align: left;
`;

const MultiFacilityImpactDashboard: React.FC<Props> = ({
  baselineScenario,
}) => {
  const { data: localeDataSource } = useLocaleDataState();
  const history = useHistory();
  const { setFacility } = useContext(FacilityContext);

  const [facilities, setFacilities] = useState({
    data: [] as Facilities,
    loading: true,
  });

  const [scenario, setScenario] = useState<{
    data: Scenario | null;
    loading: boolean;
  }>({
    data: null,
    loading: true,
  });

  const updateScenario = async (scenario: Scenario) => {
    await saveScenario(scenario);
    setScenario({ data: scenario, loading: false });
  };

  useEffect(() => {
    async function fetchScenario() {
      const result = await baselineScenario?.data?.get();
      setScenario({
        data: result?.data(),
        loading: false,
      });
    }
    fetchScenario();
  }, []);

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
      {scenario.loading ? (
        <Loading />
      ) : (
        <ScenarioSidebar
          scenario={scenario.data}
          updateScenario={updateScenario}
        />
      )}
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
