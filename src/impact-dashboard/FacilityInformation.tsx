import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputTextNumeric from "../design-system/InputTextNumeric";
import TextLabel from "../design-system/TextLabel";
import Description from "./Description";
import { EpidemicModelUpdate } from "./EpidemicModelContext";
import FormGrid from "./FormGrid";
import useModel from "./useModel";

const FacilityInformationDiv = styled.div`
  border-right: 1px solid ${Colors.grey};
  padding-right: 25px;
`;

const FormRowWrapper = styled.div<{ labelsOnly?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  ${(props) => !props.labelsOnly && "margin-bottom: 24px;"}
`;

const LabelCell = styled.div`
  box-sizing: border-box;
  width: 22%;
  flex: 0 0 auto;
  padding: 0 8px;
  align-self: center;
`;

const InputCell = styled.div<{ grow?: boolean }>`
  box-sizing: border-box;
  width: 39%;
  flex: ${(props) => (props.grow ? 1 : 0)} 0 auto;
  padding: 0 8px;
`;

interface FormHeaderRowProps {
  label: string;
}

const FormHeaderRow: React.FC<FormHeaderRowProps> = (props) => (
  <FormRowWrapper labelsOnly>
    <LabelCell />
    <InputCell>
      <TextLabel>Current Cases</TextLabel>
    </InputCell>
    <InputCell>
      <TextLabel>{props.label}</TextLabel>
    </InputCell>
  </FormRowWrapper>
);

interface FormRowProps {
  label: string;
  leftKey: keyof EpidemicModelUpdate;
  rightKey: keyof EpidemicModelUpdate;
}

const FormRow: React.FC<FormRowProps> = (props) => {
  const [model, updateModel] = useModel();

  return (
    <FormRowWrapper>
      <LabelCell>
        <TextLabel>{props.label}</TextLabel>
      </LabelCell>
      <InputCell>
        <InputTextNumeric
          type="number"
          valueEntered={model[props.leftKey] as number}
          onValueChange={(value) => updateModel({ [props.leftKey]: value })}
        />
      </InputCell>
      <InputCell>
        <InputTextNumeric
          type="number"
          valueEntered={model[props.rightKey] as number}
          onValueChange={(value) => updateModel({ [props.rightKey]: value })}
        />
      </InputCell>
    </FormRowWrapper>
  );
};

const BottomRow: React.FC = () => {
  const [model, updateModel] = useModel();

  return (
    <FormRowWrapper>
      <InputCell grow>
        <InputTextNumeric
          type="percent"
          labelAbove="Capacity (%)"
          labelHelp="Enter population as a percent of facility built capacity."
          valueEntered={model.facilityOccupancyPct}
          onValueChange={(value) =>
            updateModel({ facilityOccupancyPct: value })
          }
        />
      </InputCell>
      <InputCell grow>
        <InputTextNumeric
          type="percent"
          labelAbove="Bunk-Style Housing (%)"
          labelHelp="Enter the percent of facility in dormitory bunk style housing."
          valueEntered={model.facilityDormitoryPct as number}
          onValueChange={(value) =>
            updateModel({ facilityDormitoryPct: value })
          }
        />
      </InputCell>
    </FormRowWrapper>
  );
};

const FacilityInformation: React.FC = () => {
  return (
    <FacilityInformationDiv>
      <Description>
        This section collects basic information about facility staff and your
        incarcerated population by age and medical vulnerability. If you don't
        have your in-facility population available by age brackets, enter your
        overall population count in "Age unknown".
      </Description>
      <div>
        <FormGrid>
          <FormHeaderRow label="Staff Population" />
          <FormRow
            label="Facility Staff"
            leftKey="staffCases"
            rightKey="staffPopulation"
          />
          <tr />
          <FormHeaderRow label="Total Population" />
          <FormRow
            label="Ages Unknown"
            leftKey="ageUnknownCases"
            rightKey="ageUnknownPopulation"
          />
          <FormRow
            label="Ages 0-19"
            leftKey="age0Cases"
            rightKey="age0Population"
          />
          <FormRow
            label="Ages 20-44"
            leftKey="age20Cases"
            rightKey="age20Population"
          />
          <FormRow
            label="Ages 45-54"
            leftKey="age45Cases"
            rightKey="age45Population"
          />
          <FormRow
            label="Ages 55-64"
            leftKey="age55Cases"
            rightKey="age55Population"
          />
          <FormRow
            label="Ages 65-74"
            leftKey="age65Cases"
            rightKey="age65Population"
          />
          <FormRow
            label="Ages 75-84"
            leftKey="age75Cases"
            rightKey="age75Population"
          />
          <FormRow
            label="Ages 85+"
            leftKey="age85Cases"
            rightKey="age85Population"
          />
        </FormGrid>
        <FormGrid>
          <BottomRow />
        </FormGrid>
      </div>
    </FacilityInformationDiv>
  );
};

export default FacilityInformation;
