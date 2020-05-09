import { format } from "date-fns";
import { Link } from "gatsby";
import React, { useContext, useState } from "react";

import { saveScenario } from "../database";
import iconBackSrc from "../design-system/icons/ic_back.svg";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import { Spacer } from "../design-system/Spacer";
import useFacilitiesRtData from "../hooks/useFacilitiesRtData";
import { sumAgeGroupPopulations } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import { FacilityContext } from "../page-multi-facility/FacilityContext";
import { BaselinePopulations, Scenario } from "../page-multi-facility/types";
import BaselinePopulationModal from "./BaselinePopulationModal";
import {
  useCurrentCurveData,
  useFacilities,
  useModelInputs,
  useOriginalCurveData,
  useReductionData,
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

interface Props {
  scenario: Scenario;
  dispatchScenarioUpdate: (scenario: Scenario) => void;
}

const ResponseImpactDashboard: React.FC<Props> = ({
  scenario,
  dispatchScenarioUpdate,
}) => {
  const { data: localeDataSource } = useLocaleDataState();
  const { rtData } = useContext(FacilityContext);
  const facilities = useFacilities(scenario.id, localeDataSource);
  const modelInputs = useModelInputs(facilities, localeDataSource);
  const currentCurveInputs = useCurrentCurveData(modelInputs, localeDataSource);
  const systemWideData = useSystemWideData(
    scenario.baselinePopulations,
    facilities,
    modelInputs,
    localeDataSource,
  );
  const originalCurveInputs = useOriginalCurveData(
    modelInputs,
    systemWideData,
    localeDataSource,
  );
  const reductionCardData = useReductionData(
    originalCurveInputs,
    currentCurveInputs,
  );
  const [populationFormSubmitted, setPopulationFormSubmitted] = useState(false);

  useFacilitiesRtData(facilities.data);

  async function saveBaselinePopulations(populations: BaselinePopulations) {
    const initialPopulations = scenario?.baselinePopulations || [];
    const savedScenario = await saveScenario({
      ...scenario,
      baselinePopulations: [...initialPopulations, populations],
    });
    if (savedScenario) dispatchScenarioUpdate(savedScenario);
    setPopulationFormSubmitted(true);
  }

  // current incarcerated population
  const currentIncarceratedPop = facilities?.data?.reduce(
    (accumulator, facility) => {
      const facilityPop = sumAgeGroupPopulations(facility);
      return accumulator + facilityPop;
    },
    0,
  );

  return (
    <ResponseImpactDashboardContainer>
      {facilities.loading ? (
        <Loading />
      ) : (
        <>
          <BaselinePopulationModal
            open={!populationFormSubmitted}
            numFacilities={facilities.data.length}
            defaultStaffPopulation={systemWideData.staffPopulation}
            defaultIncarceratedPopulation={
              systemWideData.incarceratedPopulation
            }
            saveBaselinePopulations={saveBaselinePopulations}
          />
          {populationFormSubmitted && (
            <ValidDataWrapper facilities={facilities.data}>
              <PageContainer>
                <Column>
                  <Link to="/">
                    <BackDiv>
                      <IconBack alt="back" src={iconBackSrc} />
                      Back to model
                    </BackDiv>
                  </Link>
                  <PageHeader>
                    {facilities.data[0].systemType === "County Jail" &&
                    modelInputs[0].countyName !== "Total"
                      ? modelInputs[0].countyName
                      : modelInputs[0].stateCode}{" "}
                    COVID-19 Response Impact
                  </PageHeader>
                  <ReportDateDiv>
                    Report generated on {format(new Date(), "MMM dd, yyyy")}
                  </ReportDateDiv>
                  <Spacer y={24} />
                  <DescriptionTextDiv>
                    New! This report compares the impact of your system's
                    COVID-19 response against the model's initial assumptions
                    and projections.
                    <br />
                    <br />
                    Coming soon: Input historical case counts and facility
                    information to customize the impact report for greater
                    precision.
                  </DescriptionTextDiv>
                  <Spacer y={40} />
                  <SectionHeader>Overall Population Safety</SectionHeader>
                  <DescriptionTextDiv>
                    Reducing the number of incarcerated individuals increases
                    the overall number of staff and incarcerated individuals who
                    remain healthy.
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
                    reductionData={reductionCardData}
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
                  {rtData && <RtSummaryStats rtData={rtData} />}
                  <SectionSubheader>
                    Impact on community health and staff resources
                  </SectionSubheader>
                  {reductionCardData && (
                    <ReducingR0ImpactMetrics
                      reductionData={reductionCardData}
                    />
                  )}
                </Column>
                <Column>
                  <Spacer y={40} />
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
            </ValidDataWrapper>
          )}
        </>
      )}
    </ResponseImpactDashboardContainer>
  );
};

export default ResponseImpactDashboard;
