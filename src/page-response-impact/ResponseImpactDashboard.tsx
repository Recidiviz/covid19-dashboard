import React, { useContext, useState } from "react";

import { saveScenario } from "../database";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import useFacilitiesRtData from "../hooks/useFacilitiesRtData";
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
import ProjectionCharts from "./ProjectionCharts";
import ReducingR0ImpactMetrics from "./ReducingR0ImpactMetrics";
import RtSummaryStats from "./RtSummaryStats";
import {
  ChartHeader,
  PageHeader,
  PlaceholderSpace,
  ResponseImpactDashboardContainer,
  ScenarioName,
  SectionHeader,
  SectionSubheader,
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
    facilities.data[0].systemType,
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

  useFacilitiesRtData(facilities.data, true);

  async function saveBaselinePopulations(populations: BaselinePopulations) {
    const initialPopulations = scenario?.baselinePopulations || [];
    const savedScenario = await saveScenario({
      ...scenario,
      baselinePopulations: [...initialPopulations, populations],
    });
    if (savedScenario) dispatchScenarioUpdate(savedScenario);
    setPopulationFormSubmitted(true);
  }

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
                  <ScenarioName>{scenario?.name}</ScenarioName>
                  <PageHeader>COVID-19 Response Impact as of [DATE]</PageHeader>

                  <SectionHeader>Safety of Overall Population</SectionHeader>
                  <ChartHeader>
                    Reduction in the number of incarcerated individuals
                  </ChartHeader>
                  <PlaceholderSpace />
                  <SectionSubheader>
                    Positive impact of releasing [X] incarcerated individuals
                  </SectionSubheader>
                  <PopulationImpactMetrics
                    reductionData={reductionCardData}
                    staffPopulation={systemWideData.staffPopulation}
                    incarceratedPopulation={
                      systemWideData.incarceratedPopulation
                    }
                  />
                  <SectionHeader>Community Resources Saved</SectionHeader>
                  <ChartHeader>
                    Rate of spread (R(t)) for modelled facilities
                  </ChartHeader>
                  {rtData && <RtSummaryStats rtData={rtData} />}
                  <SectionSubheader>
                    Positive impact of Reducing R(0)
                  </SectionSubheader>
                  <ReducingR0ImpactMetrics />
                </Column>
                <Column>
                  <ProjectionCharts
                    systemWideData={systemWideData}
                    originalCurveInputs={originalCurveInputs}
                    currentCurveInputs={currentCurveInputs}
                  />
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
