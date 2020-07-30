import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { getFacilityById, useFacilities } from "../facilities-context";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import useScenario from "../scenario-context/useScenario";
import SiteHeader from "../site-header/SiteHeader";
import FacilityInputForm from "./FacilityInputForm";
import ReadOnlyScenarioBanner from "./ReadOnlyScenarioBanner";
import { Facility } from "./types";

const FacilityPageDiv = styled.div``;

// TODO add section header tooltips
const FacilityPage: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const {
    state: { facilities, selectedFacilityId },
  } = useFacilities();
  const [scenario, dispatchScenarioUpdate] = useScenario();
  const [facility, setFacility] = useState<Facility | undefined>();

  useEffect(() => {
    setFacility(getFacilityById(facilities, selectedFacilityId));
  });

  if (facility === undefined) {
    return <Loading />;
  } else {
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
  }
};

export default FacilityPage;
