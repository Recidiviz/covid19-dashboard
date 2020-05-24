import React from "react";
import styled from "styled-components";

import Colors from "./Colors";

interface StepProps {
  step: number;
  active?: boolean;
}

const Step = styled.span<{ active?: boolean }>`
  align-items: center;
  display: flex;
  background-color: ${(props) => (props.active ? Colors.teal : "transparent")};
  border-radius: 50%;
  border: 0.5px solid
    ${(props) => (props.active ? Colors.teal : Colors.darkGray)};
  color: ${(props) => (props.active ? Colors.white : Colors.green)};
  height: 20px;
  justify-content: center;
  margin: 0 5px;
  padding: 1em;
  width: 20px;
`;

export const ModalStep: React.FC<StepProps> = (props) => {
  const { step, active } = props;
  return <Step active={active}>{step}</Step>;
};

interface Props {
  numSteps: number;
  activeStep: number;
}

const Steps = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 10px 0;
`;

const ModalSteps: React.FC<Props> = (props) => {
  const { numSteps, activeStep } = props;
  return (
    <Steps>
      {[...Array(numSteps)].map((_, idx: number) => {
        const step = idx + 1;
        return (
          <ModalStep
            key={`${ModalStep}-${step}`}
            active={activeStep === step}
            step={step}
          />
        );
      })}
    </Steps>
  );
};

export default ModalSteps;
