import React, { useContext } from "react";
import styled from "styled-components";

import Loading from "../components/design-system/Loading";
import { EpidemicModelProvider } from "../components/impact-dashboard/EpidemicModelContext";
import SiteHeader from "../components/site-header/SiteHeader";
import { FacilityContext } from "../contexts/facility-context/FacilityContext";
import { useLocaleDataState } from "../contexts/locale-data-context";
import useScenario from "../contexts/scenario-context/useScenario";
import FacilityInputForm from "./FacilityInputForm";

const FacilityPageDiv = styled.div``;

// TODO add section header tooltips
const FacilityPage: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const { facility } = useContext(FacilityContext);
  const [scenario] = useScenario();

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
