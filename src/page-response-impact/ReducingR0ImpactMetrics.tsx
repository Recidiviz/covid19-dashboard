import React from "react";

import hospitalIcon from "./icons/ic_hospital.svg";
import staffIcon from "./icons/ic_staff.svg";
import ImpactMetricCard from "./ImpactMetricCard";
import ImpactMetricsContainer from "./ImpactMetricsContainer";
import {
  getSubtitle,
  ImpactTitleProps,
  ImpactTitleSpan,
  PopulationImpact
} from "./utils/ResponseImpactCardStateUtils";
import { round, formatValue } from "./utils/numberUtils"

const HospitalBedsTitle = ({ title, value }: ImpactTitleProps) => {
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
  populationImpact: PopulationImpact;
}

const ReducingR0ImpactMetrics: React.FC<Props> = ({
  populationImpact
}) => {
  const staffAbilityText = Math.sign(populationImpact.staffUnableToWork) === 1 ? "able" : "unable";

  return (
    <ImpactMetricsContainer>
      <ImpactMetricCard
        title={
          <HospitalBedsTitle
            title="Hospital beds used at peak"
            value={populationImpact.hospitalBedsUsed}
          />
        }
        value={`${formatValue(
          round(populationImpact.hospitalBedsUsed)
        )}%`}
        icon={hospitalIcon}
      />
      <ImpactMetricCard
        title={`Additional staff ${staffAbilityText} to work`}
        value={formatValue(populationImpact.staffUnableToWork)}
        icon={staffIcon}
      />
    </ImpactMetricsContainer>
  );
};

export default ReducingR0ImpactMetrics;
