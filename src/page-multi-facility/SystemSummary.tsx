import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import Loading from "../design-system/Loading";
import Metric from "../design-system/Metric";
import {
  getTotalPopulation,
  totalIncarceratedConfirmedCases,
} from "../impact-dashboard/EpidemicModelContext";
import { isRtData, RtData, RtRecord } from "../infection-model/rt";
import * as rtStats from "../page-response-impact/rtStatistics";
import { Facilities, Facility, RtDataMapping } from "./types";

const SystemSummaryContainer = styled.div`
  border-bottom: 1px solid ${Colors.opacityGray};
  margin-bottom: 15px;
  min-height: 280px;
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

const defaultPopulationMetrics = () => {
  return {
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
        return `${this.sum} of ${this.total}`;
      },
      label: "Facilities with confirmed cases",
      sum: 0,
      total: 0,
    },
    incarceratedCases: {
      value: 0,
      label: "Resident cases",
    },
    staffCases: {
      value: 0,
      label: "Staff cases",
    },
  };
};

const defaultRtMetrics = {
  facilitiesWithRtLessThan1: {
    get value() {
      return `${this.sum} of ${this.total}`;
    },
    label: "Facilities with a classifiable slowing rate of spread",
    sum: 0,
    total: 0,
  },
};

interface Props {
  facilities: Facilities;
  scenarioId: string | undefined;
  rtData: RtDataMapping;
}

const SystemSummary: React.FC<Props> = ({ facilities, scenarioId, rtData }) => {
  const [populationMetrics, setPopulationMetrics] = useState(
    defaultPopulationMetrics(),
  );
  const [rtMetrics, setRtMetrics] = useState({ ...defaultRtMetrics });
  const [metricsReady, setPopulationMetricsReady] = useState(false);

  useEffect(() => {
    setPopulationMetrics(defaultPopulationMetrics());
    setPopulationMetricsReady(false);
  }, [scenarioId]);

  useEffect(() => {
    const numFacilities = facilities.length;
    if (numFacilities === 0) return;

    const updatedMetrics = facilities.reduce((acc, facility: Facility) => {
      const incarceratedCases =
        totalIncarceratedConfirmedCases(facility.modelInputs) || 0;
      const staffCases = facility.modelInputs.staffCases || 0;

      acc.incarceratedPopulation.value +=
        getTotalPopulation(facility.modelInputs) || 0;
      acc.staffPopulation.value += facility.modelInputs.staffPopulation || 0;
      acc.incarceratedCases.value += incarceratedCases;
      acc.staffCases.value += staffCases;
      if (incarceratedCases + staffCases > 0) {
        acc.facilitiesWithCases.sum += 1;
      }
      acc.facilitiesWithCases.total = numFacilities;
      return acc;
    }, defaultPopulationMetrics());
    setPopulationMetrics(updatedMetrics);
    setPopulationMetricsReady(true);
  }, [facilities]);

  useEffect(
    () => {
      const rtDataValues: (RtData | null)[] = Object.values(rtData);
      const facilitiesRtRecords: RtRecord[][] = rtDataValues
        .filter(isRtData)
        .map((rtData: RtData) => rtData.Rt);

      const udpatedMetrics = { ...defaultRtMetrics };
      udpatedMetrics.facilitiesWithRtLessThan1.sum = rtStats.numFacilitiesWithRtLessThan1(
        facilitiesRtRecords,
      );
      udpatedMetrics.facilitiesWithRtLessThan1.total =
        facilitiesRtRecords.length;

      setRtMetrics(udpatedMetrics);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rtData, facilities.length],
  );

  return (
    <SystemSummaryContainer>
      <SectionHeader>System Summary</SectionHeader>
      {!metricsReady ? (
        <Loading />
      ) : (
        <MetricsContainer>
          {Object.values({ ...populationMetrics, ...rtMetrics }).map(
            (metric) => {
              return (
                <Metric
                  value={metric.value}
                  label={metric.label}
                  key={metric.label}
                />
              );
            },
          )}
        </MetricsContainer>
      )}
    </SystemSummaryContainer>
  );
};

export default SystemSummary;
