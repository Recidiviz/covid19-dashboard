import React from "react";
import styled from "styled-components";

import downArrowIcon from "./icons/ic_down_arrow.svg";
import hospitalIcon from "./icons/ic_hospital.svg";
import staffIcon from "./icons/ic_staff.svg";
import ImpactMetricCard from "./ImpactMetricCard";
import ImpactMetricsContainer from "./ImpactMetricsContainer";
import { reductionCardDataType } from "./utils/ResponseImpactCardStateUtils";

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

interface Props {
  reductionData: reductionCardDataType;
}

const ReducingR0ImpactMetrics: React.FC<Props> = ({ reductionData }) => {
  return (
    <ImpactMetricsContainer>
      <ImpactMetricCard
        title="Hospital beds used"
        value={<PercentValue value={`${reductionData?.hospitalBedsUsed}`} />}
        icon={hospitalIcon}
      />
      <ImpactMetricCard
        title="Additional staff able to work"
        value={reductionData?.staffUnableToWork}
        icon={staffIcon}
      />
    </ImpactMetricsContainer>
  );
};

export default ReducingR0ImpactMetrics;
