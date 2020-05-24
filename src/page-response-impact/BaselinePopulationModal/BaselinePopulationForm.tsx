import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../../components/design-system/Colors";
import HelpButtonWithTooltip from "../../components/design-system/HelpButtonWithTooltip";
import InputButton from "../../components/design-system/InputButton";
import InputDate from "../../components/design-system/InputDate";
import InputTextNumeric from "../../components/design-system/InputTextNumeric";
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
  flex-flow: row nowrap;
  align-items: baseline;
  line-height: 150%;
  letter-spacing: 0.15em;
`;

const Label = styled.div`
  color: ${Colors.darkForest};
  font-family: "Poppins", sans serif;
  font-weight: normal;
  font-size: 10px;
  line-height: 150%;
  margin-right: 10px;
  text-transform: uppercase;
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

const TooltipText = styled.div`
  color: ${Colors.white};
  font-family: PingFang SC;
  font-size: 14px;
  font-weight: normal;
  letter-spacing: normal;
  line-height: 26px;
`;

const buttonStyle = {
  width: "200px",
  fontSize: "14px",
};

type Props = Omit<ModalProps, "open" | "numFacilities"> & {
  setPage: () => void;
};

const dateTooltip =
  "To model the impact since the start of COVID-19, enter a date prior to any COVID-19 mitigation efforts.";
const totalIncarceratedTooltip =
  "Enter the total incarcerated population across all modelled facilities at the selected date.";
const totalStaffTooltip =
  "Enter the total staff population across all modelled facilities at the selected date.";

const BaselinePopulationForm: React.FC<Props> = ({
  defaultIncarceratedPopulation,
  defaultStaffPopulation,
  saveBaselinePopulations,
  defaultDate,
  setPage,
}) => {
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
            <HelpButtonWithTooltip>
              <TooltipText>{dateTooltip}</TooltipText>
            </HelpButtonWithTooltip>
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
            <HelpButtonWithTooltip>
              <TooltipText>{totalIncarceratedTooltip}</TooltipText>
            </HelpButtonWithTooltip>
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
            <HelpButtonWithTooltip>
              <TooltipText>{totalStaffTooltip}</TooltipText>
            </HelpButtonWithTooltip>
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
