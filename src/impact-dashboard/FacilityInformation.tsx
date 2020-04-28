import numeral from "numeral";
import React from "react";
import styled from "styled-components";

import InputTextNumeric from "../design-system/InputTextNumeric";
import TextLabel from "../design-system/TextLabel";
import { getAdjustedTotalPopulation } from "../infection-model";
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

const InputNote = styled(Description)`
  margin-bottom: 0;
  font-style: italic;
`;

interface FormRowProps {
  inputs: React.ReactNodeArray;
}

const FormRow: React.FC<FormRowProps> = ({ inputs }) => (
  <FormGridRow>
    {inputs.map((input, i) => (
      <FormGridCell key={i}>{input}</FormGridCell>
    ))}
  </FormGridRow>
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

interface AgeGroupRowProps {
  label: string;
  leftKey: keyof EpidemicModelUpdate;
  rightKey: keyof EpidemicModelUpdate;
}

const AgeGroupRow: React.FC<AgeGroupRowProps> = (props) => {
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

const FacilityInformation: React.FC = () => {
  const [model, updateModel] = useModel();

  return (
    <FacilityInformationDiv>
      <div>
        <FormGrid>
          <FormHeaderRow label="Staff Population" />
          <AgeGroupRow
            label="Facility Staff"
            leftKey="staffCases"
            rightKey="staffPopulation"
          />
          {/* empty row for spacing */}
          <FormGridRow />
          <FormHeaderRow label="Total Population" />
          <AgeGroupRow
            label="Ages Unknown"
            leftKey="ageUnknownCases"
            rightKey="ageUnknownPopulation"
          />
          <AgeGroupRow
            label="Ages 0-19"
            leftKey="age0Cases"
            rightKey="age0Population"
          />
          <AgeGroupRow
            label="Ages 20-44"
            leftKey="age20Cases"
            rightKey="age20Population"
          />
          <AgeGroupRow
            label="Ages 45-54"
            leftKey="age45Cases"
            rightKey="age45Population"
          />
          <AgeGroupRow
            label="Ages 55-64"
            leftKey="age55Cases"
            rightKey="age55Population"
          />
          <AgeGroupRow
            label="Ages 65-74"
            leftKey="age65Cases"
            rightKey="age65Population"
          />
          <AgeGroupRow
            label="Ages 75-84"
            leftKey="age75Cases"
            rightKey="age75Population"
          />
          <AgeGroupRow
            label="Ages 85+"
            leftKey="age85Cases"
            rightKey="age85Population"
          />
        </FormGrid>
        <FormGrid>
          <FormRow
            inputs={[
              <InputTextNumeric
                key="occupancy"
                type="percent"
                labelAbove="Occupancy rate"
                labelHelp="Enter occupancy rate as a percent of capacity."
                valueEntered={model.facilityOccupancyPct}
                onValueChange={(value) =>
                  updateModel({ facilityOccupancyPct: value })
                }
              />,
              <InputTextNumeric
                key="bunks"
                type="percent"
                labelAbove="Bunk-Style Housing"
                labelHelp="Enter the percent of facility in dormitory bunk style housing."
                valueEntered={model.facilityDormitoryPct as number}
                onValueChange={(value) =>
                  updateModel({ facilityDormitoryPct: value })
                }
              />,
            ]}
          />
          <FormRow
            inputs={[
              <>
                <InputTextNumeric
                  key="turnover"
                  type="percent"
                  labelAbove="Population turnover"
                  labelHelp={`Admissions as a percent of releases in a typical 3mo period
                  (e.g., April - June 2019). Can be over or under 100%.`}
                  valueEntered={model.populationTurnover}
                  onValueChange={(value) =>
                    updateModel({ populationTurnover: value })
                  }
                />
                {model.populationTurnover !== 0 && (
                  <InputNote>
                    Your updated total population impacted is{" "}
                    {numeral(getAdjustedTotalPopulation(model)).format("0,0")}
                  </InputNote>
                )}
              </>,
            ]}
          />
        </FormGrid>
      </div>
    </FacilityInformationDiv>
  );
};

export default FacilityInformation;
