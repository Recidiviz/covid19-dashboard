import numeral from "numeral";
import React, { useState } from "react";
import styled from "styled-components";

import InputTextNumeric from "../design-system/InputTextNumeric";
import TextLabel from "../design-system/TextLabel";
import {
  curveInputsFromUserInputs,
  getAdjustedTotalPopulation,
} from "../infection-model";
import Description from "./Description";
import {
  EpidemicModelState,
  EpidemicModelUpdate,
} from "./EpidemicModelContext";
import { FormGrid, FormGridCell, FormGridRow } from "./FormGrid";
import useModel from "./useModel";

const FacilityInformationDiv = styled.div``;

const LabelRow = styled(FormGridRow)`
  margin-bottom: 0;
`;

const CollapseIcon = styled.span`
  font-size: xx-small;
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
      <TextLabel>Current Cases (Cumulative)</TextLabel>
    </InputCell>
    <InputCell>
      <TextLabel>{props.label}</TextLabel>
    </InputCell>
  </LabelRow>
);

interface AgeGroupGridProps {
  model: Partial<EpidemicModelState>;
  updateModel: (update: EpidemicModelUpdate) => void;
  collapsible?: boolean;
}

export const AgeGroupGrid: React.FC<AgeGroupGridProps> = ({
  collapsible = false,
  ...props
}) => {
  const [collapsed, setCollapsed] = useState(collapsible);
  const ageSpecificCaseCounts = (
    <>
      <AgeGroupRow
        label="Ages 0-19"
        leftKey="age0Cases"
        rightKey="age0Population"
        {...props}
      />
      <AgeGroupRow
        label="Ages 20-44"
        leftKey="age20Cases"
        rightKey="age20Population"
        {...props}
      />
      <AgeGroupRow
        label="Ages 45-54"
        leftKey="age45Cases"
        rightKey="age45Population"
        {...props}
      />
      <AgeGroupRow
        label="Ages 55-64"
        leftKey="age55Cases"
        rightKey="age55Population"
        {...props}
      />
      <AgeGroupRow
        label="Ages 65-74"
        leftKey="age65Cases"
        rightKey="age65Population"
        {...props}
      />
      <AgeGroupRow
        label="Ages 75-84"
        leftKey="age75Cases"
        rightKey="age75Population"
        {...props}
      />
      <AgeGroupRow
        label="Ages 85+"
        leftKey="age85Cases"
        rightKey="age85Population"
        {...props}
      />
    </>
  );
  return (
    <FormGrid>
      <FormGridRow />
      <FormHeaderRow label="Staff Population" />
      <AgeGroupRow
        label="Facility Staff"
        leftKey="staffCases"
        rightKey="staffPopulation"
        {...props}
      />
      {/* empty row for spacing */}
      <FormGridRow />
      <FormHeaderRow label="Total Population" />
      <AgeGroupRow
        label="Resident population (ages unknown)"
        leftKey="ageUnknownCases"
        rightKey="ageUnknownPopulation"
        {...props}
      />
      {collapsed ? (
        <div
          className="flex flex-row justify-center mt-8 cursor-pointer"
          onClick={() => {
            setCollapsed(false);
          }}
        >
          <TextLabel>Add residents and cases by age</TextLabel>
          <CollapseIcon>▾</CollapseIcon>
        </div>
      ) : (
        ageSpecificCaseCounts
      )}
    </FormGrid>
  );
};

interface AgeGroupRowProps {
  label: string;
  leftKey: keyof EpidemicModelUpdate;
  rightKey: keyof EpidemicModelUpdate;
  model: Partial<EpidemicModelState>;
  updateModel: (update: EpidemicModelUpdate) => void;
}

const AgeGroupRow: React.FC<AgeGroupRowProps> = (props) => {
  const { model, updateModel } = props;
  const [inputRelativityError, setInputRelativityError] = useState(false);

  function checkInputRelativity(
    cases: number | undefined,
    total: number | undefined,
  ) {
    if (cases === undefined) {
      setInputRelativityError(false);
    } else if (cases !== undefined && total === undefined) {
      setInputRelativityError(true);
    } else if (total !== undefined && cases > total) {
      setInputRelativityError(true);
    } else {
      setInputRelativityError(false);
    }
  }

  return (
    <FormGridRow>
      <LabelCell>
        <TextLabel>{props.label}</TextLabel>
      </LabelCell>
      <InputCell>
        <InputTextNumeric
          type="number"
          valueEntered={model[props.leftKey] as number}
          inputRelativityError={inputRelativityError}
          onValueChange={(value) => {
            checkInputRelativity(value, model[props.rightKey] as number);
            updateModel({ [props.leftKey]: value });
          }}
        />
      </InputCell>
      <InputCell>
        <InputTextNumeric
          type="number"
          valueEntered={model[props.rightKey] as number}
          onValueChange={(value) => {
            checkInputRelativity(model[props.leftKey] as number, value);
            updateModel({ [props.rightKey]: value });
          }}
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
        <AgeGroupGrid model={model} updateModel={updateModel} />
        <FormGrid>
          <FormRow
            inputs={[
              <InputTextNumeric
                key="capacity"
                type="number"
                labelAbove="Capacity"
                labelHelp="Enter capacity of the facility."
                valueEntered={model.facilityCapacity}
                onValueChange={(value) =>
                  updateModel({ facilityCapacity: value })
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
                    {numeral(
                      getAdjustedTotalPopulation(
                        curveInputsFromUserInputs(model),
                      ),
                    ).format("0,0")}
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
