import React from "react";
import styled from "styled-components";

import ChartArea from "../impact-dashboard/ChartArea";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import ImpactProjectionTable from "../impact-dashboard/ImpactProjectionTableContainer";
import SiteHeader from "../site-header/SiteHeader";
import FacilityInformationSection from "./FacilityInformationSection";
import LocaleInformationSection from "./LocaleInformationSection";
import RateOfSpreadSection from "./RateOfSpreadSection";

const UnnamedFacilityPageDiv = styled.div``;
const UnnamedFacilityInputForm = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  margin-top: 40px;
`;
const FormColumn = styled.div`
  margin-right: 5vw;
  flex: 1 0 auto;
  width: 350px;
`;
const ChartsColumn = styled.div`
  flex: 2 0 auto;
  width: 350px;
`;

// TODO add section header tooltips
// TODO add summary at bottom of Locale Information
// TODO full page styling
// TODO rate of spread section
// TODO use FormGrid
const UnnamedFacilityPage: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();

  return (
    <EpidemicModelProvider localeDataSource={localeDataSource}>
      <UnnamedFacilityPageDiv>
        <div className="font-body text-green min-h-screen tracking-normal w-full">
          <div className="max-w-screen-xl px-4 mx-auto">
            <SiteHeader />
            <UnnamedFacilityInputForm>
              <FormColumn>
                <h1 className="text-3xl mb-5 leading-none">Unnamed Facility</h1>
                <LocaleInformationSection />
                <FacilityInformationSection />
                <RateOfSpreadSection />
              </FormColumn>
              <ChartsColumn>
                <ChartArea />
                <ImpactProjectionTable />
              </ChartsColumn>
            </UnnamedFacilityInputForm>
          </div>
        </div>
      </UnnamedFacilityPageDiv>
    </EpidemicModelProvider>
  );
};

export default UnnamedFacilityPage;
