import { format } from "date-fns";
import { Link } from "gatsby";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";

import { getFacilities } from "../database";
import Colors from "../design-system/Colors";
import iconBackSrc from "../design-system/icons/ic_back.svg";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import { Spacer } from "../design-system/Spacer";
import useFacilitiesRtData from "../hooks/useFacilitiesRtData";
import {
  EpidemicModelState,
  getLocaleDefaults,
} from "../impact-dashboard/EpidemicModelContext";
import { CurveFunctionInputs } from "../infection-model";
import { useLocaleDataState } from "../locale-data-context";
import { FacilityContext } from "../page-multi-facility/FacilityContext";
import { Facilities } from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import PopulationImpactMetrics from "./PopulationImpactMetrics";
import ProjectionCharts from "./ProjectionCharts";
import ReducingR0ImpactMetrics from "./ReducingR0ImpactMetrics";
import {
  calculateCurveData,
  getCurveInputs,
  getModelInputs,
  getSystemWideSums,
  originalProjection,
} from "./responseChartData";
import RtSummaryStats from "./RtSummaryStats";
import {
  ChartHeader,
  PageHeader,
  PlaceholderSpace,
  ResponseImpactDashboardContainer,
  SectionHeader,
  SectionSubheader,
} from "./styles";
import {
  buildReductionData,
  buildResponseImpactCardData,
  reductionCardDataType,
} from "./utils/ResponseImpactCardStateUtils";
import ValidDataWrapper from "./ValidDataWrapper";

const BackDiv = styled.div`
  font-family: Poppins;
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 150%;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${Colors.green};
  display: flex;
  align-items: center;
  justify-items: center;
`;

const IconBack = styled.img`
  margin-right: 6px;
`;

const ReportDateDiv = styled.div`
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  line-height: 150%;
  color: ${Colors.opacityForest};
`;

const DescriptionTextDiv = styled.div`
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 150%;
  color: ${Colors.forest50};
`;

const SectionHeaderBare = styled.h1`
  font-family: "Libre Baskerville";
  font-weight: normal;
  font-size: 19px;
  line-height: 24px;
  letter-spacing: -0.06em;
  color: ${Colors.forest};
`;

const TakeActionBox = styled.div`
  background-color: ${Colors.gray};
  border-radius: 4px;
  padding: 40px;
`;

const TakeActionText = styled.div`
  font-family: Poppins;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 150%;
  color: ${Colors.opacityForest};
`;

const TakeActionLink = styled.span`
  color: ${Colors.teal};
`;

const TakeActionBullet = styled.li`
  font-family: Poppins;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 150%;
  color: ${Colors.opacityForest};
  list-style: disc inside;
  padding-left: 24px;
`;

const ResponseImpactDashboard: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const [scenarioState] = useScenario();
  const { rtData } = useContext(FacilityContext);
  const scenarioId = scenarioState?.data?.id; // linter wants this to be its own var since it is a useEffect dep
  const [currentCurveInputs, setCurrentCurveInputs] = useState(
    [] as CurveFunctionInputs[],
  );
  const [originalCurveInputs, setOriginalCurveInputs] = useState(
    [] as CurveFunctionInputs[],
  );
  const [modelInputs, setModelInputs] = useState([] as EpidemicModelState[]);
  const [systemWideData, setSystemWideData] = useState({
    hospitalBeds: 0,
    staffPopulation: 0,
    incarceratedPopulation: 0,
  });
  const [reductionCardData, setreductionCardData] = useState<
    reductionCardDataType | undefined
  >();
  const [facilities, setFacilities] = useState({
    data: [] as Facilities,
    loading: true,
  });

  useEffect(() => {
    async function fetchFacilities() {
      if (!scenarioId) return;
      const facilitiesData = await getFacilities(scenarioId);
      if (facilitiesData) {
        setFacilities({
          data: facilitiesData,
          loading: false,
        });

        const modelInputs = getModelInputs(facilitiesData, localeDataSource);
        const currentCurveInputs = getCurveInputs(modelInputs);
        setModelInputs(modelInputs);
        setCurrentCurveInputs(currentCurveInputs);
      }
    }

    fetchFacilities();
  }, [scenarioId, localeDataSource]);

  useFacilitiesRtData(facilities.data, true);

  // calculate data for cards
  useEffect(() => {
    const originalCurveDataPerFacility = calculateCurveData(
      originalCurveInputs,
    );
    const origData = buildResponseImpactCardData(originalCurveDataPerFacility);
    const currentCurveDataPerFacility = calculateCurveData(currentCurveInputs);
    const currData = buildResponseImpactCardData(currentCurveDataPerFacility);

    // positive value is a reduction
    const reduction = buildReductionData(origData, currData);

    setreductionCardData(reduction);
  }, [originalCurveInputs, currentCurveInputs]);

  // calculate original and current curves
  useEffect(() => {
    if (modelInputs.length === 0) return;
    const originalInputs = getModelInputs(
      originalProjection(systemWideData),
      localeDataSource,
    );
    const originalCurveInputs = getCurveInputs(originalInputs);
    setOriginalCurveInputs(originalCurveInputs);
  }, [modelInputs, systemWideData, localeDataSource]);

  // set system wide data
  useEffect(() => {
    if (modelInputs.length === 0) return;
    const localeDefaults = getLocaleDefaults(
      localeDataSource,
      modelInputs[0].stateCode,
      modelInputs[0].countyName,
    );

    setSystemWideData({
      ...getSystemWideSums(modelInputs),
      incarceratedPopulation:
        facilities.data[0].systemType === "State Prison"
          ? localeDefaults.totalPrisonPopulation
          : localeDefaults.totalJailPopulation,
    });
  }, [modelInputs, localeDataSource, facilities.data]);

  return (
    <ResponseImpactDashboardContainer>
      {modelInputs.length === 0 ? (
        <Loading />
      ) : (
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
                {facilities.data[0].systemType === "State Prison" ||
                facilities.data[0].systemType === "State Jail"
                  ? modelInputs[0].stateCode
                  : ""}
                {facilities.data[0].systemType === "County Jail"
                  ? modelInputs[0].countyName
                  : ""}{" "}
                COVID-19 Response Impact
              </PageHeader>
              <ReportDateDiv>
                Report generated on {format(new Date(), "MMM dd, yyyy")}
              </ReportDateDiv>
              <Spacer y={24} />
              <DescriptionTextDiv>
                New! This report compares the impact of your system's COVID-19
                response against the model's initial assumptions and
                projections.
                <br />
                <br />
                Coming soon: Input historical case counts and facility
                information to customize the impact report for greater
                precision.
              </DescriptionTextDiv>
              <Spacer y={40} />
              <SectionHeader>Overall Population Safety</SectionHeader>
              <DescriptionTextDiv>
                Reducing the number of incarcerated individuals increases the
                overall number of staff and incarcerated individuals who remain
                healthy.
              </DescriptionTextDiv>
              <Spacer y={40} />
              <ChartHeader>
                Reduction in the number of incarcerated individuals
              </ChartHeader>
              <PlaceholderSpace />
              <SectionSubheader>
                Impact on health of overall population
              </SectionSubheader>
              <PopulationImpactMetrics
                reductionData={reductionCardData}
                staffPopulation={systemWideData.staffPopulation}
                incarceratedPopulation={systemWideData.incarceratedPopulation}
              />
              <Spacer y={24} />
              <SectionHeader>Community Resources Saved</SectionHeader>
              <DescriptionTextDiv>
                Taking actions to slow the rate of spread, R(t), increases the
                amount of system-wide and community-health resources available.
              </DescriptionTextDiv>
              <Spacer y={40} />
              <ChartHeader>
                Rate of spread (R(t)) for modelled facilities
              </ChartHeader>
              {rtData && <RtSummaryStats rtData={rtData} />}
              <SectionSubheader>
                Impact on community health and staff resources
              </SectionSubheader>
              <ReducingR0ImpactMetrics />
            </Column>
            <Column>
              <Spacer y={40} />
              <SectionHeaderBare>
                Original vs. Current Projections
              </SectionHeaderBare>
              <Spacer y={24} />
              <DescriptionTextDiv>
                The top graph shows the initially modelled projection for
                COVID-19 through the overall system. The bottom graph represents
                the projection as of today.
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
                    <a href="mailto:covid@recidiviz.org">covid@recidiviz.org</a>
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
    </ResponseImpactDashboardContainer>
  );
};

export default ResponseImpactDashboard;
