import React, { useContext } from "react";
import styled from "styled-components";

import { FetchedFacilities } from "../constants";
import Colors from "../design-system/Colors";
import Loading from "../design-system/Loading";
import Metric from "../design-system/Metric";
import {
  getTotalPopulation,
  totalIncarceratedConfirmedCases,
} from "../impact-dashboard/EpidemicModelContext";
import { isRtData, RtData, RtRecord } from "../infection-model/rt";
import * as rtStats from "../page-response-impact/rtStatistics";
import { FacilityContext } from "./FacilityContext";
import { Facilities, Facility } from "./types";

const SystemSummaryContainer = styled.div`
  border-bottom: 1px solid ${Colors.opacityGray};
  margin-bottom: 15px;
  min-height: 230px;
`;

const SectionHeader = styled.div`
  color: ${Colors.forest};
  font-family: "Libre Baskerville", serif;
  font-size: 24px;
  letter-spacing: -0.06em;
  line-height: 24px;
  text-align: left;
  padding-bottom: 15px;
  font-weight: normal;
`;

const MetricsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 15px;
`;

interface Props {
  facilities: FetchedFacilities;
}

const SystemSummary: React.FC<Props> = ({ facilities }) => {
  const numFacilities = facilities.data.length;

  const { rtData } = useContext(FacilityContext);
  const rtDataValues: (RtData | null)[] = Object.values({ ...rtData });

  const facilitiesRtRecords: RtRecord[][] = rtDataValues
    .filter(isRtData)
    .map((rtData: RtData) => rtData.Rt);

  const metrics = {
    incarceratedPopulation: {
      value: 0,
      label: "Resident population",
    },
    staffPopulation: {
      value: 0,
      label: "Staff population",
    },
    facilitiesWithCases: {
      get value() {
        return `${this.sum} of ${numFacilities}`;
      },
      label: "Facilities with confirmed cases",
      sum: 0,
    },
    incarceratedCases: {
      value: 0,
      label: "Resident cases",
    },
    staffCases: {
      value: 0,
      label: "Staff cases",
    },
    facilitiesWithRtLessThan1: {
      value: `${rtStats.numFacilitiesWithRtLessThan1(
        facilitiesRtRecords,
      )} of ${numFacilities}`,
      label: "Facilities with a slowing rate of spread",
    },
  };

  const calculateMetrics = (facilities: Facilities) => {
    return facilities.reduce((metrics, facility: Facility) => {
      const incarceratedCases =
        totalIncarceratedConfirmedCases(facility.modelInputs) || 0;
      const staffCases = facility.modelInputs.staffCases || 0;

      metrics.incarceratedPopulation.value +=
        getTotalPopulation(facility.modelInputs) || 0;
      metrics.staffPopulation.value +=
        facility.modelInputs.staffPopulation || 0;
      metrics.incarceratedCases.value += incarceratedCases;
      metrics.staffCases.value += staffCases;
      if (incarceratedCases + staffCases > 0) {
        metrics.facilitiesWithCases.sum += 1;
      }

      return metrics;
    }, metrics);
  };

  return (
    <SystemSummaryContainer>
      <SectionHeader>System Summary</SectionHeader>
      {facilities.loading ? (
        <Loading />
      ) : (
        <MetricsContainer>
          {Object.values(calculateMetrics(facilities.data)).map((metric) => {
            return (
              <Metric
                value={metric.value}
                label={metric.label}
                key={metric.label}
              />
            );
          })}
        </MetricsContainer>
      )}
    </SystemSummaryContainer>
  );
};

export default SystemSummary;
