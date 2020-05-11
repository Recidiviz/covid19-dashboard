import React from "react";

import hospitalIcon from "./icons/ic_hospital.svg";
import staffIcon from "./icons/ic_staff.svg";
import ImpactMetricCard from "./ImpactMetricCard";
import ImpactMetricsContainer from "./ImpactMetricsContainer";
import {
  getSubtitle,
  ImpactTitleProps,
  ImpactTitleSpan,
} from "./utils/ResponseImpactCardStateUtils";

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

const ReducingR0ImpactMetrics: React.FC = () => {
  // TODO: Replace with actual data
  const staffAbleToWork = 200;
  const percentageBedsUsed = 50;
  const percentageOfStaff = 12;
  const percentageOfIncarcerated = 12;
  const staffAbilityText = Math.sign(staffAbleToWork) === 1 ? "able" : "unable";

  return (
    <ImpactMetricsContainer>
      <ImpactMetricCard
        title={
          <HospitalBedsTitle
            title="Hospital beds used at peak"
            value={percentageBedsUsed}
          />
        }
        value={`${Math.abs(percentageBedsUsed)}%`}
        subtitle={`${Math.abs(percentageOfStaff)}% of staff`}
        icon={hospitalIcon}
      />
      <ImpactMetricCard
        title={`Additional staff ${staffAbilityText} to work`}
        value={Math.abs(staffAbleToWork)}
        subtitle={`${Math.abs(percentageOfIncarcerated)}% of incarcerated`}
        icon={staffIcon}
      />
    </ImpactMetricsContainer>
  );
};

export default ReducingR0ImpactMetrics;
