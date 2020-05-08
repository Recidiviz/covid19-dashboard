import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../../design-system/Colors";
import InputButton from "../../design-system/InputButton";
import InputDate from "../../design-system/InputDate";
import InputTextNumeric from "../../design-system/InputTextNumeric";
import { Props as ModalProps } from ".";

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
  margin: 20px 0;
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

const Text = styled.div`
  border-bottom: 0.5px solid ${Colors.darkGray};
  color: ${Colors.opacityForest};
  font-family: "Poppins", sans serif;
  font-size: 12px;
  font-weight: normal;
  line-height: 150%;
  padding: 20px 0 40px 0;
`;

const InputContainer = styled.div`
  width: 170px;
`;

const FormContainer = styled.div`
  padding: 2vw;
`;

const buttonStyle = {
  width: "200px",
  fontFamily: "PingFang SC",
  fontSize: "14px",
};

type Props = Omit<ModalProps, "open" | "numFacilities"> & {
  setPage: () => void;
};

const BaselinePopulationForm: React.FC<Props> = ({
  defaultIncarceratedPopulation,
  defaultStaffPopulation,
  saveBaselinePopulations,
  setPage,
}) => {
  // Default Original Date 2/1/2020
  const defaultDate = new Date(2020, 1, 1);

  const [populations, setPopulations] = useState({
    staffPopulation: defaultStaffPopulation,
    incarceratedPopulation: defaultIncarceratedPopulation,
    date: defaultDate,
  });

  function handleInputChange(property: string, value: number | Date) {
    setPopulations({ ...populations, [property]: value });
  }

  function handleSubmit() {
    saveBaselinePopulations(populations);
  }

  return (
    <>
      <Text>
        Enter a starting date and population prior to any COVID-19 mitigation
        efforts. If you leave this blank, we will assume a starting population
        based on publicly available data.
      </Text>
      <FormContainer>
        <FormRow>
          <LabelContainer>
            <Label>Starting date as benchmark</Label>
          </LabelContainer>
          <InputDate
            onValueChange={(date) => {
              if (date) handleInputChange("date", date);
            }}
            valueEntered={populations.date}
          />
        </FormRow>
        <FormRow>
          <LabelContainer>
            <Label>Total Incarcerated Population</Label>
          </LabelContainer>
          <InputContainer>
            <InputTextNumeric
              type="number"
              onValueChange={(value) => {
                if (value) handleInputChange("incarceratedPopulation", value);
              }}
              valueEntered={populations.incarceratedPopulation}
            />
          </InputContainer>
        </FormRow>
        <FormRow>
          <LabelContainer>
            <Label>Total Staff Population</Label>
          </LabelContainer>
          <InputContainer>
            <InputTextNumeric
              type="number"
              onValueChange={(value) => {
                if (value) handleInputChange("staffPopulation", value);
              }}
              valueEntered={populations.staffPopulation}
            />
          </InputContainer>
        </FormRow>
      </FormContainer>
      <ModalFooter>
        <InputButton
          styles={{
            ...buttonStyle,
            width: "80px",
            background: "transparent",
            color: Colors.forest,
          }}
          label="< Back"
          onClick={setPage}
        />
        <InputButton
          styles={buttonStyle}
          label="Generate"
          onClick={handleSubmit}
        />
      </ModalFooter>
    </>
  );
};

export default BaselinePopulationForm;
