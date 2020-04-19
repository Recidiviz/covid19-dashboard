import React, { useContext } from "react";
import styled from "styled-components";

import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import SiteHeader from "../site-header/SiteHeader";
import { FacilityContext } from "./FacilityContext";
import FacilityInputForm from "./FacilityInputForm";

const FacilityPageDiv = styled.div``;

// TODO add section header tooltips
// TODO add summary at bottom of Locale Information
const FacilityPage: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const { facility } = useContext(FacilityContext);

  return (
    <EpidemicModelProvider
      facilityModel={facility?.modelInputs}
      localeDataSource={localeDataSource}
    >
      <FacilityPageDiv>
        <div className="font-body text-green min-h-screen tracking-normal w-full">
          <div className="max-w-screen-xl px-4 mx-auto">
            <SiteHeader />
            <FacilityInputForm />
          </div>
        </div>
      </FacilityPageDiv>
    </EpidemicModelProvider>
  );
};

export default FacilityPage;
