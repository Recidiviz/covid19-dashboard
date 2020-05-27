import React, { useContext } from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import useScenario from "../scenario-context/useScenario";
import SiteHeader from "../site-header/SiteHeader";
import { FacilityContext } from "./FacilityContext";
import FacilityInputForm from "./FacilityInputForm";
import ReadOnlyScenarioBanner from "./ReadOnlyScenarioBanner";

const FacilityPageDiv = styled.div``;

// TODO add section header tooltips
const FacilityPage: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const { facility } = useContext(FacilityContext);
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
                <SiteHeader />
                <FacilityInputForm scenarioId={scenario.data.id} />
              </div>
            </div>
          </FacilityPageDiv>
        </EpidemicModelProvider>
      )}
    </>
  );
};

export default FacilityPage;
