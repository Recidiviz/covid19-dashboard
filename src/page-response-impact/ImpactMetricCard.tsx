import React from "react";
import styled from "styled-components";

import Colors from "../components/design-system/Colors";

const CardContainer = styled.div`
  background-color: rgba(22, 26, 33, 0.04);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  width: 100%;

  &:first-child {
    margin-right: 24px;
  }
`;

const CardTitle = styled.div`
  color: ${Colors.forest};
  font-family: "Poppins", sans serif;
  font-size: 13px;
  font-weight: normal;
  letter-spacing: -0.02em;
  line-height: 16px;
  padding: 17px 13px 0;
`;

const ValueContainer = styled.div`
  color: ${Colors.opacityForest};
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 7px 13px 10px 13px;
`;

const Value = styled.div`
  display: flex;
  flex-direction: column;
  font-family: "Poppins", sans serif;
  font-size: 36px;
  font-weight: 500;
  line-height: 150%;
`;

const Subtitle = styled.div`
  font-family: "Poppins", sans serif;
  font-size: 14px;
  font-weight: 300;
  line-height: 150%;
  color: ${Colors.opacityForest};
`;

const Icon = styled.img`
  @media (max-width: 900px) {
    display: none;
  }
`;

interface Props {
  title: string | React.ReactElement;
  value: number | string | React.ReactElement;
  icon: string;
  subtitle?: string;
}

const ImpactMetricCard: React.FC<Props> = (props) => {
  const { title, value, subtitle, icon } = props;

  return (
    <CardContainer>
      <CardTitle>{title}</CardTitle>
      <ValueContainer>
        <Value>
          {value}
          <Subtitle>{subtitle}</Subtitle>
        </Value>
        <Icon src={icon} />
      </ValueContainer>
    </CardContainer>
  );
};

export default ImpactMetricCard;
