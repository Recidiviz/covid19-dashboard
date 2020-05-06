import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import ambulanceIcon from "./icons/ic_ambulance.svg";
import heartIcon from "./icons/ic_heart.svg";
import ImpactMetricCard from "./ImpactMetricCard";
import ImpactMetricsContainer from "./ImpactMetricsContainer";
import { reductionCardDataType } from "./utils/ResponseImpactCardStateUtils";

const TitleSpan = styled.span`
  color: ${Colors.teal};
`;

const Title = ({ title }: { [title: string]: string }) => {
  return (
    <>
      <span>{title}</span> <TitleSpan>reduced by</TitleSpan>
    </>
  );
};

interface Props {
  reductionData: reductionCardDataType | undefined;
  staffPopulation: number;
  incarceratedPopulation: number;
}

function round(percent: number): number {
  return Math.round(percent * 100);
}

const PopulationImpactMetrics: React.FC<Props> = ({
  reductionData,
  staffPopulation,
  incarceratedPopulation,
}) => {
  if (!reductionData || !staffPopulation || !incarceratedPopulation) {
    return null;
  }
  const { incarcerated, staff } = reductionData;
  return (
    <>
      <ImpactMetricsContainer>
        <ImpactMetricCard
          title={<Title title="Staff fatalities" />}
          value={staff.fatalities}
          subtitle={`${round(staff.fatalities / staffPopulation)}% of staff`}
          icon={heartIcon}
        />
        <ImpactMetricCard
          title={<Title title="Incarcerated fatalities" />}
          value={incarcerated.fatalities}
          subtitle={`${round(
            incarcerated.fatalities / incarceratedPopulation,
          )}% of incarcerated`}
          icon={heartIcon}
        />
      </ImpactMetricsContainer>
      <ImpactMetricsContainer>
        <ImpactMetricCard
          title={<Title title="Staff hospitalization" />}
          value={staff.hospitalized}
          subtitle={`${round(staff.hospitalized / staffPopulation)}% of staff`}
          icon={ambulanceIcon}
        />
        <ImpactMetricCard
          title={<Title title="Incarcerated hospitalization" />}
          value={incarcerated.hospitalized}
          subtitle={`${round(
            incarcerated.hospitalized / incarceratedPopulation,
          )}% of incarcerated`}
          icon={ambulanceIcon}
        />
      </ImpactMetricsContainer>
    </>
  );
};

export default PopulationImpactMetrics;
