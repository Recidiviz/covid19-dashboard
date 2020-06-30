import { isUndefined, omitBy, pickBy } from "lodash";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import InputTextNumeric from "../design-system/InputTextNumeric";
import TextLabel from "../design-system/TextLabel";
import { useToasts } from "../design-system/Toast";
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

const pastAgesKnown = (model: Record<string, any> | undefined) => {
  if (model !== undefined) {
    let keys = Object.keys(model);
    return keys.some(function (key) {
      return RegExp(/age\d+/).test(key);
    });
  } else {
    return true;
  }
};

const pastAgesUnknown = (model: Record<string, any> | undefined) => {
  if (model !== undefined) {
    let keys = Object.keys(model);
    return keys.some(function (key) {
      return RegExp(/ageUnknown\w+/).test(key);
    });
  } else {
    return true;
  }
};

const includesKnownAges = (model: object) => {
  let definedInputs = omitBy(model, isUndefined);
  let ageKnownInputs = pickBy(definedInputs, (_, key) => {
    return RegExp(/age\d+/).test(key);
  });
  let total = Object.values(ageKnownInputs).reduce((sum, n) => {
    return sum + n;
  }, 0);
  return total > 0;
};

const includesUnknownAges = (model: object) => {
  let definedInputs = omitBy(model, isUndefined);
  let ageUnknownInputs = pickBy(definedInputs, (_, key) => {
    return RegExp(/ageUnknown\w+/).test(key);
  });
  let array = Object.values(ageUnknownInputs);
  let total = array.reduce((sum, n) => {
    return sum + n;
  }, 0);
  return total > 0;
};

interface AgeGroupGridProps {
  model: Partial<EpidemicModelState>;
  updateModel: (update: EpidemicModelUpdate) => void;
  collapsible?: boolean;
  warnedAt: number;
  setWarnedAt: (warnedAt: number) => void;
}

export const AgeGroupGrid: React.FC<AgeGroupGridProps> = ({
  collapsible = false,
  ...props
}) => {
  const [collapsed, setCollapsed] = useState(collapsible);

  const collapseAgeInputs = () => {
    if (pastAgesKnown(props.model)) {
      return false;
    } else if (
      pastAgesKnown(props.model) === false &&
      pastAgesUnknown(props.model) === true
    ) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    setCollapsed(collapseAgeInputs());
    // only want to run this once, on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ageSpecificCaseCounts = (
    <>
      <AgeGroupRow
        label="Residents Ages 0-19"
        leftKey="age0Cases"
        rightKey="age0Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 20-44"
        leftKey="age20Cases"
        rightKey="age20Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 45-54"
        leftKey="age45Cases"
        rightKey="age45Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 55-64"
        leftKey="age55Cases"
        rightKey="age55Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 65-74"
        leftKey="age65Cases"
        rightKey="age65Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 75-84"
        leftKey="age75Cases"
        rightKey="age75Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 85+"
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
      {collapsed ? (
        <div>
          <AgeGroupRow
            label="Resident population (ages unknown)"
            leftKey="ageUnknownCases"
            rightKey="ageUnknownPopulation"
            {...props}
          />
          <div
            className="flex flex-row justify-center mt-8 cursor-pointer"
            onClick={() => {
              setCollapsed(false);
            }}
          >
            <TextLabel margin={true}>Add residents and cases by age</TextLabel>
          </div>
        </div>
      ) : (
        <div>
          {ageSpecificCaseCounts}
          <div
            className="flex flex-row justify-center mt-8 cursor-pointer"
            onClick={() => {
              setCollapsed(true);
            }}
          >
            <TextLabel margin={true}>
              Add residents and cases without ages
            </TextLabel>
          </div>
        </div>
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
  warnedAt: number;
  setWarnedAt: (warnedAt: number) => void;
}

const AgeGroupRow: React.FC<AgeGroupRowProps> = (props) => {
  const { model, updateModel } = props;
  const [inputRelativityError, setInputRelativityError] = useState(false);
  const { addToast } = useToasts();

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

  const checkAgeConflict = (model: object) => {
    if (Date.now() > props.warnedAt + 10000) {
      if (includesUnknownAges(model) && includesKnownAges(model)) {
        addToast(
          "To prevent duplicate counting, known and unknown ages cannot be entered together. Please clear either the unknown age input or all age inputs.",
          { appearance: "error" },
        );
        props.setWarnedAt(Date.now());
      }
    }
  };

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
            checkAgeConflict(model);
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
            checkAgeConflict(model);
          }}
        />
      </InputCell>
    </FormGridRow>
  );
};

const FacilityInformation: React.FC = () => {
  const [model, updateModel] = useModel();
  const [warnedAt, setWarnedAt] = useState(0);

  return (
    <FacilityInformationDiv>
      <div>
        <AgeGroupGrid
          model={model}
          updateModel={updateModel}
          warnedAt={warnedAt}
          setWarnedAt={setWarnedAt}
        />
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
