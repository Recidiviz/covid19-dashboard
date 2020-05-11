import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import ambulanceIcon from "./icons/ic_ambulance.svg";
import heartIcon from "./icons/ic_heart.svg";
import ImpactMetricCard from "./ImpactMetricCard";
import ImpactMetricsContainer from "./ImpactMetricsContainer";
import {
  getSubtitle,
  PopulationImpact,
} from "./utils/ResponseImpactCardStateUtils";

const TitleSpan = styled.span`
  color: ${(props) => props.color || Colors.teal};
`;

type TitleProps = {
  title: string;
  value: number;
};

const Title = ({ title, value }: TitleProps) => {
  const valueSign = Math.sign(value);
  const subtitle = getSubtitle(valueSign);
  return (
    <>
      <span>{title}</span>{" "}
      <TitleSpan color={subtitle.color}>{subtitle.text}</TitleSpan>
    </>
  );
};

interface Props {
  populationImpact: PopulationImpact | undefined;
  staffPopulation: number;
  incarceratedPopulation: number;
}

function round(percent: number): number {
  return Math.round(percent * 100);
}

function formatValue(value: number): number {
  return Math.abs(value);
}

const PopulationImpactMetrics: React.FC<Props> = ({
  populationImpact,
  staffPopulation,
  incarceratedPopulation,
}) => {
  if (!populationImpact || !staffPopulation || !incarceratedPopulation) {
    return null;
  }
  const { incarcerated, staff } = populationImpact;

  return (
    <>
      <ImpactMetricsContainer>
        <ImpactMetricCard
          title={<Title title="Staff fatalities" value={staff.fatalities} />}
          value={formatValue(staff.fatalities)}
          subtitle={`${round(staff.fatalities / staffPopulation)}% of staff`}
          icon={heartIcon}
        />
        <ImpactMetricCard
          title={
            <Title
              title="Incarcerated fatalities"
              value={incarcerated.fatalities}
            />
          }
          value={formatValue(incarcerated.fatalities)}
          subtitle={`${round(
            incarcerated.fatalities / incarceratedPopulation,
          )}% of incarcerated`}
          icon={heartIcon}
        />
      </ImpactMetricsContainer>
      <ImpactMetricsContainer>
        <ImpactMetricCard
          title={
            <Title title="Staff hospitalization" value={staff.hospitalized} />
          }
          value={formatValue(staff.hospitalized)}
          subtitle={`${round(staff.hospitalized / staffPopulation)}% of staff`}
          icon={ambulanceIcon}
        />
        <ImpactMetricCard
          title={
            <Title
              title="Incarcerated hospitalization"
              value={incarcerated.hospitalized}
            />
          }
          value={formatValue(incarcerated.hospitalized)}
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
