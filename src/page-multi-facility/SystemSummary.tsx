import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import Metric from "../design-system/Metric";
import { Facilities } from "./types";

const SystemSummaryContainer = styled.div`
  border-bottom: 1px solid ${Colors.opacityGray};
  margin-bottom: 15px;
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
  facilities?: Facilities[];
}

const SystemSummary: React.FC<Props> = ({ facilities }) => {
  const metrics = {
    incarceratedPopulation: {
      value: 10000,
      label: "Total resident population",
    },
    staffPopulation: {
      value: 100,
      label: "Total staff population",
    },
    incarceratedCases: {
      value: 1000,
      label: "Total resident cases",
    },
    staffCases: {
      value: 10,
      label: "Total staff cases",
    },
    facilitiesWithCases: {
      value: "5 of 10",
      label: "Facilities with confirmed cases",
    },
    facilitiesWithSlowingRos: {
      value: "1 of 10",
      label: "Facilities with a slowing rate of spread",
    },
  };

  return (
    <SystemSummaryContainer>
      <SectionHeader>System Summary</SectionHeader>
      <MetricsContainer>
        {Object.values(metrics).map((metric) => {
          return (
            <Metric
              value={metric.value}
              label={metric.label}
              key={metric.label}
            />
          );
        })}
      </MetricsContainer>
    </SystemSummaryContainer>
  );
};

export default SystemSummary;
