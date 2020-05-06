import { navigate } from "gatsby";
import React from "react";
import styled from "styled-components";

import Colors from "../../design-system/Colors";
import InputButton from "../../design-system/InputButton";
import InputDate from "../../design-system/InputDate";
import InputTextNumeric from "../../design-system/InputTextNumeric";

const ModalFooter = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 1em 0;
  width: 100%;
`;

const FormRow = styled.div`
  align-items: center;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const LabelContainer = styled.div`
  display: flex;
  flex-flow: column;
  line-height: 150%;
  letter-spacing: 0.15em;
`;

const Label = styled.div`
  font-family: "Poppins", sans serif;
  font-weight: normal;
  font-size: 10px;
  line-height: 150%;
  text-transform: uppercase;
  color: ${Colors.darkForest};
`;

const SubLabel = styled.div`
  font-family: "Helvetica Neue", sans serif;
  font-weight: 300;
  font-size: 14px;
  color: ${Colors.opacityForest};
`;

const Text = styled.div`
  color: ${Colors.opacityForest};
  font-family: "Poppins", sans serif;
  font-size: 12px;
  font-weight: normal;
  line-height: 150%%;
  padding-top: 20px;
`;

const InputContainer = styled.div`
  width: 170px;
`;

const FormContainer = styled.div`
  padding: 2vw;
`;

interface Props {
  setBaselinePopulations: React.Dispatch<React.SetStateAction<any>>;
}

const BaselinePopulationForm: React.FC<Props> = ({
  setBaselinePopulations,
}) => {
  return (
    <>
      <Text>
        If you skip this step, we will assume a starting incarcerated population
        of XXXX, which is derived from Vera data, and your current staff
        population. You can also provide this information later.
      </Text>
      <FormContainer>
        <FormRow>
          <LabelContainer>
            <Label>Starting date as baseline</Label>
          </LabelContainer>
          <InputDate
            onValueChange={(date) => {
              console.log(date);
            }}
            valueEntered={new Date(2020, 2, 1)}
          />
        </FormRow>
        <FormRow>
          <LabelContainer>
            <Label>Total Incarcerated Population</Label>
            <SubLabel>Starting at the baseline date</SubLabel>
          </LabelContainer>
          <InputContainer>
            <InputTextNumeric
              type="number"
              onValueChange={(number) => {
                console.log({ number });
              }}
              valueEntered={0}
            />
          </InputContainer>
        </FormRow>
        <FormRow>
          <LabelContainer>
            <Label>Total Staff Population</Label>
            <SubLabel>Starting at the baseline date</SubLabel>
          </LabelContainer>
          <InputContainer>
            <InputTextNumeric
              type="number"
              onValueChange={(number) => {
                console.log({ number });
              }}
              valueEntered={0}
            />
          </InputContainer>
        </FormRow>
      </FormContainer>
      <ModalFooter>
        <InputButton
          styles={{
            width: "80px",
            fontFamily: "PingFang SC",
            fontSize: "14px",
            color: Colors.forest,
            background: "transparent",
          }}
          label="< Back"
          onClick={() => navigate("/")}
        />
        <InputButton
          styles={{
            width: "200px",
            fontFamily: "PingFang SC",
            fontSize: "14px",
          }}
          label="Generate"
          onClick={() => navigate("/")}
        />
      </ModalFooter>
    </>
  );
};

export default BaselinePopulationForm;
