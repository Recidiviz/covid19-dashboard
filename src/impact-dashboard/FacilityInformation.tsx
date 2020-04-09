import styled from "styled-components";

import InputTextNumeric from "../design-system/InputTextNumeric";
import TextLabel from "../design-system/TextLabel";
import Description from "./Description";
import { EpidemicModelUpdate } from "./EpidemicModelContext";
import { FormGrid, FormGridCell, FormGridRow } from "./FormGrid";
import useModel from "./useModel";

const FacilityInformationDiv = styled.div``;

const LabelRow = styled(FormGridRow)`
  margin-bottom: 0;
`;

const LabelCell: React.FC = (props) => (
  <FormGridCell width={22} vAlign="center">
    {props.children}
  </FormGridCell>
);

const InputCell: React.FC = (props) => (
  <FormGridCell width={39}>{props.children}</FormGridCell>
);

interface FormHeaderRowProps {
  label: string;
}

const FormHeaderRow: React.FC<FormHeaderRowProps> = (props) => (
  <LabelRow>
    <LabelCell />
    <InputCell>
      <TextLabel>Current Cases</TextLabel>
    </InputCell>
    <InputCell>
      <TextLabel>{props.label}</TextLabel>
    </InputCell>
  </LabelRow>
);

interface FormRowProps {
  label: string;
  leftKey: keyof EpidemicModelUpdate;
  rightKey: keyof EpidemicModelUpdate;
}

const FormRow: React.FC<FormRowProps> = (props) => {
  const [model, updateModel] = useModel();

  return (
    <FormGridRow>
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
    </FormGridRow>
  );
};

const BottomRow: React.FC = () => {
  const [model, updateModel] = useModel();

  return (
    <FormGridRow>
      <FormGridCell>
        <InputTextNumeric
          type="percent"
          labelAbove="Capacity (%)"
          labelHelp="Enter population as a percent of facility built capacity."
          valueEntered={model.facilityOccupancyPct}
          onValueChange={(value) =>
            updateModel({ facilityOccupancyPct: value })
          }
        />
      </FormGridCell>
      <FormGridCell>
        <InputTextNumeric
          type="percent"
          labelAbove="Bunk-Style Housing (%)"
          labelHelp="Enter the percent of facility in dormitory bunk style housing."
          valueEntered={model.facilityDormitoryPct as number}
          onValueChange={(value) =>
            updateModel({ facilityDormitoryPct: value })
          }
        />
      </FormGridCell>
    </FormGridRow>
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
