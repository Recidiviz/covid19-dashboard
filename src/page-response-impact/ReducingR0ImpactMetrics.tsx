import React from "react";
import styled from "styled-components";

import downArrowIcon from "./icons/ic_down_arrow.svg";
import hospitalIcon from "./icons/ic_hospital.svg";
import staffIcon from "./icons/ic_staff.svg";
import ImpactMetricCard from "./ImpactMetricCard";
import ImpactMetricsContainer from "./ImpactMetricsContainer";

const Icon = styled.img`
  display: inline;
  margin-right: 15px;
`;

const PercentValue = ({ value }: { [value: string]: string }) => {
  // Note: This assumes the icon should always be a down arrow, should confirm
  return (
    <div>
      <Icon src={downArrowIcon} alt="down arrow icon" />
      <span>{value}</span>
    </div>
  );
};

const ReducingR0ImpactMetrics: React.FC = () => {
  // TODO: Replace with actual data
  return (
    <ImpactMetricsContainer>
      <ImpactMetricCard
        title="Hospital beds used"
        value={<PercentValue value={"50%"} />}
        subtitle="12% of staff"
        icon={hospitalIcon}
      />
      <ImpactMetricCard
        title="Additional staff able to work"
        value={200}
        subtitle="12% of incarcerated"
        icon={staffIcon}
      />
    </ImpactMetricsContainer>
  );
};

export default ReducingR0ImpactMetrics;
