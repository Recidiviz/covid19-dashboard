import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";

const MetricContainer = styled.div`
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  margin: 5px;
  background-color: ${Colors.lightGray};
  flex: 1 1 30%;
  height: 96px;
  font-family: "Poppins", sans serif;
  text-align: center;
  line-height: 24px;
  justify-content: center;
`;

const Value = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${Colors.burgundy};
`;

const Label = styled.div`
  font-size: 12px;
  font-weight: normal;
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
