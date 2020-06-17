import { format } from "date-fns";
import { Link } from "gatsby";
import React, { useState } from "react";
import styled from "styled-components";

import { saveScenario } from "../database";
import iconBackSrc from "../design-system/icons/ic_back.svg";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import { Spacer } from "../design-system/Spacer";
import { useCurrentCurveData } from "../hooks/useCurrentCurveData";
import { useEpidemicModelState } from "../hooks/useEpidemicModelState";
import useRejectionToast from "../hooks/useRejectionToast";
import { sumAgeGroupPopulations } from "../impact-dashboard/EpidemicModelContext";
import { getFacilitiesRtDataById } from "../infection-model/rt";
import { useLocaleDataState } from "../locale-data-context";
import { BaselinePopulations, Scenario } from "../page-multi-facility/types";
import { Facilities, RtDataMapping } from "../page-multi-facility/types";
import BaselinePopulationModal from "./BaselinePopulationModal";
import {
  useOriginalCurveData,
  usePopulationImpactData,
  useSystemWideData,
} from "./hooks";
import PopulationImpactMetrics from "./PopulationImpactMetrics";
import PopulationReduction from "./PopulationReduction";
import ProjectionCharts from "./ProjectionCharts";
import ReducingR0ImpactMetrics from "./ReducingR0ImpactMetrics";
import RtSummaryStats from "./RtSummaryStats";
import {
  BackDiv,
  ChartHeader,
  DescriptionTextDiv,
  IconBack,
  PageHeader,
  ReportDateDiv,
  ResponseImpactDashboardContainer,
  SectionHeader,
  SectionHeaderBare,
  SectionSubheader,
  TakeActionBox,
  TakeActionBullet,
  TakeActionLink,
  TakeActionText,
} from "./styles";
import ValidDataWrapper from "./ValidDataWrapper";

const PageHeaderContainer = styled.div``;

interface Props {
  loading: boolean;
  rtData: RtDataMapping;
  facilities: Facilities;
  scenario: Scenario;
  dispatchScenarioUpdate: (scenario: Scenario) => void;
}

const ResponseImpactDashboard: React.FC<Props> = ({
  loading,
  facilities,
  rtData,
  scenario,
  dispatchScenarioUpdate,
}) => {
  const { data: localeDataSource } = useLocaleDataState();
  const epidemicModelState = useEpidemicModelState(
    facilities,
    localeDataSource,
  );
  const currentCurveInputs = useCurrentCurveData(
    epidemicModelState,
    localeDataSource,
  );
  const systemWideData = useSystemWideData(
    scenario.baselinePopulations,
    facilities,
    epidemicModelState,
    localeDataSource,
  );
  const originalCurveInputs = useOriginalCurveData(
    epidemicModelState,
    systemWideData,
    localeDataSource,
  );
  const populationImpactData = usePopulationImpactData(
    originalCurveInputs,
    currentCurveInputs,
  );
  const [populationFormSubmitted, setPopulationFormSubmitted] = useState(false);

  const rejectionToast = useRejectionToast();

  const facilitiesRtData = getFacilitiesRtDataById(rtData, facilities);

  async function saveBaselinePopulations(populations: BaselinePopulations) {
    const initialPopulations = scenario?.baselinePopulations || [];
    rejectionToast(
      saveScenario({
        ...scenario,
        baselinePopulations: [...initialPopulations, populations],
      }).then((savedScenario) => {
        if (savedScenario) dispatchScenarioUpdate(savedScenario);
      }),
    ).then(() => setPopulationFormSubmitted(true));
  }

  // current incarcerated population
  const currentIncarceratedPop = facilities.reduce((accumulator, facility) => {
    const facilityPop = sumAgeGroupPopulations(facility);
    return accumulator + facilityPop;
  }, 0);

  return (
    <ResponseImpactDashboardContainer>
      {loading ? (
        <Loading />
      ) : (
        <>
          <BaselinePopulationModal
            open={!populationFormSubmitted}
            numFacilities={facilities.length}
            defaultDate={systemWideData.baselinePopulationDate}
            defaultStaffPopulation={systemWideData.staffPopulation}
            defaultIncarceratedPopulation={
              systemWideData.incarceratedPopulation
            }
            saveBaselinePopulations={saveBaselinePopulations}
          />
          {populationFormSubmitted && (
            <ValidDataWrapper facilities={facilities}>
              <>
                <PageHeaderContainer className="m-5">
                  <Link to="/">
                    <BackDiv>
                      <IconBack alt="back" src={iconBackSrc} />
                      Back to model
                    </BackDiv>
                  </Link>
                  <PageHeader>
                    {facilities[0].systemType === "County Jail" &&
                    epidemicModelState[0].countyName !== "Total"
                      ? epidemicModelState[0].countyName
                      : epidemicModelState[0].stateName}{" "}
                    COVID-19 Response Impact
                  </PageHeader>
                  <ReportDateDiv>
                    Report generated on {format(new Date(), "MMM dd, yyyy")}
                  </ReportDateDiv>
                </PageHeaderContainer>
                <PageContainer>
                  <Column>
                    <DescriptionTextDiv>
                      This report compares the impact of your system's COVID-19
                      response against the model's initial assumptions and
                      projections.
                    </DescriptionTextDiv>
                    <Spacer y={40} />
                    <SectionHeader>Overall Population Safety</SectionHeader>
                    <DescriptionTextDiv>
                      Reducing the number of incarcerated individuals increases
                      the overall number of staff and incarcerated individuals
                      who remain healthy.
                    </DescriptionTextDiv>
                    <Spacer y={40} />
                    {systemWideData.incarceratedPopulation &&
                      currentIncarceratedPop && (
                        <PopulationReduction
                          originalPop={systemWideData.incarceratedPopulation}
                          currentPop={currentIncarceratedPop}
                        />
                      )}
                    <SectionSubheader>
                      Impact on health of overall population
                    </SectionSubheader>
                    <PopulationImpactMetrics
                      populationImpact={populationImpactData}
                      staffPopulation={systemWideData.staffPopulation}
                      incarceratedPopulation={
                        systemWideData.incarceratedPopulation
                      }
                    />
                    <Spacer y={24} />
                    <SectionHeader>Community Resources Saved</SectionHeader>
                    <DescriptionTextDiv>
                      Taking actions to slow the rate of spread, R(t), increases
                      the amount of system-wide and community-health resources
                      available.
                    </DescriptionTextDiv>
                    <Spacer y={40} />
                    <ChartHeader>
                      Rate of spread, R(t), for modelled facilities
                    </ChartHeader>
                    {facilitiesRtData && (
                      <RtSummaryStats rtData={facilitiesRtData} />
                    )}
                    <SectionSubheader>
                      Peak impact on community health and staff resources
                    </SectionSubheader>
                    {populationImpactData && (
                      <ReducingR0ImpactMetrics
                        populationImpact={populationImpactData}
                      />
                    )}
                  </Column>
                  <Column>
                    <SectionHeaderBare>
                      Original vs. Current Projections
                    </SectionHeaderBare>
                    <Spacer y={24} />
                    <DescriptionTextDiv>
                      The top graph shows the initially modelled projection for
                      COVID-19 through the overall system. The bottom graph
                      represents the projection as of today.
                    </DescriptionTextDiv>
                    <Spacer y={40} />
                    <ProjectionCharts
                      systemWideData={systemWideData}
                      originalCurveInputs={originalCurveInputs}
                      currentCurveInputs={currentCurveInputs}
                    />
                    <TakeActionBox>
                      <SectionHeaderBare>Take Action</SectionHeaderBare>
                      <Spacer y={24} />
                      <TakeActionText>
                        Please reach out to{" "}
                        <TakeActionLink>
                          <a href="mailto:covid@recidiviz.org">
                            covid@recidiviz.org
                          </a>
                        </TakeActionLink>{" "}
                        for the following:
                      </TakeActionText>
                      <Spacer y={24} />
                      <ul>
                        <TakeActionBullet>
                          Turning the impact numbers into a press release.
                        </TakeActionBullet>
                        <Spacer y={16} />
                        <TakeActionBullet>
                          Creating a more customized impact model.
                        </TakeActionBullet>
                        <Spacer y={16} />
                        <TakeActionBullet>
                          Further impact modelling on budget, public safety, and
                          community health.
                        </TakeActionBullet>
                      </ul>
                    </TakeActionBox>
                  </Column>
                </PageContainer>
              </>
            </ValidDataWrapper>
          )}
        </>
      )}
    </ResponseImpactDashboardContainer>
  );
};

export default ResponseImpactDashboard;
