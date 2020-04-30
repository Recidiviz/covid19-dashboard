import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import ambulanceIcon from "./icons/ic_ambulance.svg";
import heartIcon from "./icons/ic_heart.svg";
import ImpactMetricCard from "./ImpactMetricCard";
import ImpactMetricsContainer from "./ImpactMetricsContainer";

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

const PopulationImpactMetrics: React.FC = () => {
  // TODO: Replace with actual data
  return (
    <>
      <ImpactMetricsContainer>
        <ImpactMetricCard
          title={<Title title="Staff fatalities" />}
          value={12}
          subtitle="12% of staff"
          icon={heartIcon}
        />
        <ImpactMetricCard
          title={<Title title="Incarcerated fatalities" />}
          value={42}
          subtitle="12% of incarcerated"
          icon={heartIcon}
        />
      </ImpactMetricsContainer>
      <ImpactMetricsContainer>
        <ImpactMetricCard
          title={<Title title="Staff hospitalization" />}
          value={7}
          subtitle="12% of staff"
          icon={ambulanceIcon}
        />
        <ImpactMetricCard
          title={<Title title="Incarcerated hospitalization" />}
          value={138}
          subtitle="12% of incarcerated"
          icon={ambulanceIcon}
        />
      </ImpactMetricsContainer>
    </>
  );
};

export default PopulationImpactMetrics;
