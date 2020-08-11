import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { getFacilityById, useFacilities } from "../facilities-context";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import useScenario from "../scenario-context/useScenario";
import SiteHeader from "../site-header/SiteHeader";
import FacilityInputForm from "./FacilityInputForm";
import ReadOnlyScenarioBanner from "./ReadOnlyScenarioBanner";

const FacilityPageDiv = styled.div``;

// TODO add section header tooltips
const FacilityPage: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const {
    state: { facilities, selectedFacilityId },
  } = useFacilities();
  const facility = getFacilityById(facilities, selectedFacilityId);
  const [scenario, dispatchScenarioUpdate] = useScenario();

  return (
    <>
      {scenario.loading || !scenario?.data?.id ? (
        <Loading />
      ) : (
        <EpidemicModelProvider
          facilityModel={facility?.modelInputs}
          localeDataSource={localeDataSource}
        >
          <FacilityPageDiv>
            {scenario.data && (
              <ReadOnlyScenarioBanner
                scenario={scenario.data}
                dispatchScenarioUpdate={dispatchScenarioUpdate}
              />
            )}
            <div className="font-body text-green min-h-screen tracking-normal w-full">
              <div className="max-w-screen-xl px-4 mx-auto">
                <SiteHeader styles={{ borderBottom: "none" }} />
                <FacilityInputForm
                  key={selectedFacilityId || undefined}
                  scenarioId={scenario.data.id}
                />
              </div>
            </div>
          </FacilityPageDiv>
        </EpidemicModelProvider>
      )}
    </>
  );
};

export default FacilityPage;
