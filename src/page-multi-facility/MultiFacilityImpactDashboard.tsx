import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { getBaselineScenario, getFacilities, saveScenario } from "../database";
import Colors from "../design-system/Colors";
import iconAddSrc from "../design-system/icons/ic_add.svg";
import Loading from "../design-system/Loading";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import { FacilityContext } from "./FacilityContext";
import FacilityRow from "./FacilityRow";
import { BaselineScenarioRef } from "./MultiFacilityPage";
import ProjectionsHeader from "./ProjectionsHeader";
import ScenarioSidebar from "./ScenarioSidebar";
import { Facilities, Scenario } from "./types";

const MultiFacilityImpactDashboardContainer = styled.main.attrs({
  className: `
    flex
    mt-8
  `,
})``;

interface Props {
  baselineScenarioRef?: BaselineScenarioRef;
}

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

const MultiFacilityImpactDashboard: React.FC<Props> = ({
  baselineScenarioRef,
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
      const scenario = await getBaselineScenario(baselineScenarioRef?.data);
      setScenario({
        data: scenario,
        loading: false,
      });
    }
    fetchScenario();
  }, []);

  async function fetchFacilities() {
    const facilitiesData = await getFacilities();

    if (facilitiesData) {
      setFacilities({
        data: facilitiesData,
        loading: false,
      });
    }
  }

  useEffect(() => {
    fetchFacilities();
  }, []);

  const openAddFacilityPage = () => {
    setFacility(null);
    history.push("/facility");
  };

  return (
    <MultiFacilityImpactDashboardContainer>
      {scenario.loading ? (
        <Loading />
      ) : (
        <ScenarioSidebar
          numFacilities={facilities?.data.length}
          scenario={scenario.data}
          updateScenario={updateScenario}
        />
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
