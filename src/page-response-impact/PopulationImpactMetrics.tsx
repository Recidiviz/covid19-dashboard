import React from "react";

import ambulanceIcon from "./icons/ic_ambulance.svg";
import heartIcon from "./icons/ic_heart.svg";
import ImpactMetricCard from "./ImpactMetricCard";
import ImpactMetricsContainer from "./ImpactMetricsContainer";
import { formatAbsValue, formatPercent } from "./utils/numberUtils";
import {
  getSubtitle,
  ImpactTitleProps,
  ImpactTitleSpan,
  PopulationImpact,
} from "./utils/ResponseImpactCardStateUtils";

const Title = ({ title, value }: ImpactTitleProps) => {
  const valueSign = Math.sign(value);
  const subtitle = getSubtitle(valueSign);
  return (
    <>
      <span>{title}</span>{" "}
      <ImpactTitleSpan color={subtitle.color}>{subtitle.text}</ImpactTitleSpan>
    </>
  );
};

interface Props {
  populationImpact: PopulationImpact | undefined;
  staffPopulation: number;
  incarceratedPopulation: number;
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
          value={formatAbsValue(staff.fatalities)}
          subtitle={`${formatAbsValue(
            formatPercent(staff.fatalities / staffPopulation),
          )}% of staff`}
          icon={heartIcon}
        />
        <ImpactMetricCard
          title={
            <Title
              title="Incarcerated fatalities"
              value={incarcerated.fatalities}
            />
          }
          value={formatAbsValue(incarcerated.fatalities)}
          subtitle={`${formatAbsValue(
            formatPercent(incarcerated.fatalities / incarceratedPopulation),
          )}% of incarcerated`}
          icon={heartIcon}
        />
      </ImpactMetricsContainer>
      <ImpactMetricsContainer>
        <ImpactMetricCard
          title={
            <Title title="Staff hospitalization" value={staff.hospitalized} />
          }
          value={formatAbsValue(staff.hospitalized)}
          subtitle={`${formatAbsValue(
            formatPercent(staff.hospitalized / staffPopulation),
          )}% of staff`}
          icon={ambulanceIcon}
        />
        <ImpactMetricCard
          title={
            <Title
              title="Incarcerated hospitalization"
              value={incarcerated.hospitalized}
            />
          }
          value={formatAbsValue(incarcerated.hospitalized)}
          subtitle={`${formatAbsValue(
            formatPercent(incarcerated.hospitalized / incarceratedPopulation),
          )}% of incarcerated`}
          icon={ambulanceIcon}
        />
      </ImpactMetricsContainer>
    </>
  );
};

export default PopulationImpactMetrics;
