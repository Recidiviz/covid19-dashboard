import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";

const MetricContainer = styled.div`
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 15px 15px 15px 0;
`;

const Value = styled.div`
  display: flex;
  flex-direction: column;
  font-family: "Poppins", sans serif;
  font-size: 24px;
  font-weight: 500;
  line-height: 150%;
`;

const Label = styled.div`
  font-family: "Poppins", sans serif;
  font-size: 14px;
  font-weight: 300;
  line-height: 150%;
  color: ${Colors.opacityForest};
`;


interface Props {
  value: number | string | React.ReactElement;
  label?: string;
}

const Metric: React.FC<Props> = (props) => {
  const { value, label } = props;

  return (
    <MetricContainer>
      <Value>
        {value}
        <Label>{label}</Label>
      </Value>
    </MetricContainer>
  );
};

export default Metric;
