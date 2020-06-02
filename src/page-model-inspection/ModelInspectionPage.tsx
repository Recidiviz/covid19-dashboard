import { schemeCategory10 } from "d3";
import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import ChartArea from "../impact-dashboard/ChartArea";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import FacilityInformation from "../impact-dashboard/FacilityInformation";
import LocaleInformation from "../impact-dashboard/LocaleInformation";
import MitigationInformation from "../impact-dashboard/MitigationInformation";
import { seirIndex, seirIndexList } from "../infection-model/seir";
import { buildInitialCurveToggles } from "../page-multi-facility/curveToggles";
import { useProjectionData } from "../page-multi-facility/projectionCurveHooks";
import ModelInspectionTable from "./ModelInspectionTableContainer";

const borderStyle = `1px solid ${Colors.paleGreen}`;

const SectionHeader = styled.header`
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 16px;
  margin-bottom: 16px;
`;

const SubsectionHeader = styled.header`
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  margin-bottom: 12px;
`;

/* Charts */

const ChartsContainer = styled.div`
  flex: 2 0 auto;
  width: 350px;
  margin: 0 15px;
`;

const ImpactDashboardVDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 30px;
`;

const FormColumn = styled.div`
  box-sizing: border-box;
  flex: 1 0 auto;
  width: 350px;
  border-right: ${borderStyle};
  padding-bottom: 30px;
  padding-right: 25px;
`;

const HorizontalDivider = styled.hr`
  border-top: ${borderStyle};
  margin: 40px 0;
`;

const initialToggleStatus = buildInitialCurveToggles(seirIndexList);
const markColors = seirIndexList.reduce((colors, currentIndex) => {
  return {
    ...colors,
    [seirIndex[currentIndex]]: schemeCategory10[currentIndex],
  };
}, {});

const ModelInspectionPage: React.FC = () => {
  return (
    <div>
      <SectionHeader>Locale Information</SectionHeader>
      <LocaleInformation />
      <SectionHeader>Facility Customization</SectionHeader>
      <ImpactDashboardVDiv>
        <FormColumn>
          <SubsectionHeader>Facility Population</SubsectionHeader>
          <FacilityInformation />
          <HorizontalDivider />
          <SubsectionHeader>COVID-19 Mitigation Efforts</SubsectionHeader>
          <MitigationInformation />
        </FormColumn>
        <ChartsContainer>
          <ChartArea
            projectionData={useProjectionData(useEpidemicModelState())}
            initialCurveToggles={initialToggleStatus}
            markColors={markColors}
          />
        </ChartsContainer>
      </ImpactDashboardVDiv>
      <ModelInspectionTable />
    </div>
  );
};

export default ModelInspectionPage;
