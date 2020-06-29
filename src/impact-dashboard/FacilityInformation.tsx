import numeral from "numeral";
import React, { useEffect, useState } from "react";
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

const LabelCell: React.FC = (props) => (
  <FormGridCell width={22} vAlign="center">
    {props.children}
  </FormGridCell>
);

const InputCell: React.FC = (props) => (
  <FormGridCell width={20}>{props.children}</FormGridCell>
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
      <TextLabel>Cumulative Cases</TextLabel>
    </InputCell>
    <InputCell>
      <TextLabel>Recovered Cases</TextLabel>
    </InputCell>
    <InputCell>
      <TextLabel>Deaths</TextLabel>
    </InputCell>
    <InputCell>
      <TextLabel>{props.label}</TextLabel>
    </InputCell>
  </LabelRow>
);

const passedAgesKnown = (model: Record<string, any> | undefined) => {
  if (model !== undefined) {
    let keys = Object.keys(model);
    return keys.some(function (key) {
      return RegExp(/age\d+/).test(key);
    });
  } else {
    return true;
  }
};

const passedAgesUnknown = (model: Record<string, any> | undefined) => {
  if (model !== undefined) {
    let keys = Object.keys(model);
    return keys.some(function (key) {
      return RegExp(/ageUnknown\w+/).test(key);
    });
  } else {
    return true;
  }
};

const collapseAgeInputs = (model: Record<string, any> | undefined) => {
  if (passedAgesKnown(model)) {
    return false;
  } else if (
    passedAgesKnown(model) === false &&
    passedAgesUnknown(model) === true
  ) {
    return true;
  } else {
    return false;
  }
};

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

  useEffect(() => {
    setCollapsed(collapseAgeInputs(props.model));
  }, [props.model]);

  const ageSpecificCaseCounts = (
    <>
      <AgeGroupRow
        label="Residents Ages 0-19"
        firstKey="age0Cases"
        secondKey="age0Recovered"
        thirdKey="age0Deaths"
        lastKey="age0Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 20-44"
        firstKey="age20Cases"
        secondKey="age20Recovered"
        thirdKey="age20Deaths"
        lastKey="age20Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 45-54"
        firstKey="age45Cases"
        secondKey="age45Recovered"
        thirdKey="age45Deaths"
        lastKey="age45Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 55-64"
        firstKey="age55Cases"
        secondKey="age55Recovered"
        thirdKey="age55Deaths"
        lastKey="age55Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 65-74"
        firstKey="age65Cases"
        secondKey="age65Recovered"
        thirdKey="age65Deaths"
        lastKey="age65Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 75-84"
        firstKey="age75Cases"
        secondKey="age75Recovered"
        thirdKey="age75Deaths"
        lastKey="age75Population"
        {...props}
      />
      <AgeGroupRow
        label="Residents Ages 85+"
        firstKey="age85Cases"
        secondKey="age85Recovered"
        thirdKey="age85Deaths"
        lastKey="age85Population"
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
        firstKey="staffCases"
        secondKey="staffRecovered"
        thirdKey="staffDeaths"
        lastKey="staffPopulation"
        {...props}
      />

      {/* empty row for spacing */}
      <FormGridRow />
      <FormHeaderRow label="Total Population" />
      {collapsed ? (
        <div>
          <AgeGroupRow
            label="Resident population (ages unknown)"
            firstKey="ageUnknownCases"
            secondKey="ageUnknownRecovered"
            thirdKey="ageUnknownDeaths"
            lastKey="ageUnknownPopulation"
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
  firstKey: keyof EpidemicModelUpdate;
  secondKey: keyof EpidemicModelUpdate;
  thirdKey: keyof EpidemicModelUpdate;
  lastKey: keyof EpidemicModelUpdate;
  model: Partial<EpidemicModelState>;
  updateModel: (update: EpidemicModelUpdate) => void;
}

const AgeGroupRow: React.FC<AgeGroupRowProps> = (props) => {
  const { model, updateModel } = props;
  const [inputRelativityError, setInputRelativityError] = useState(false);

  function checkInputRelativity(
    cases: number | undefined,
    recovered: number | undefined,
    deaths: number | undefined,
    total: number | undefined,
  ) {
    if (cases === undefined) {
      setInputRelativityError(false);
    } else if (cases !== undefined && total === undefined) {
      setInputRelativityError(true);
    } else if (total !== undefined && cases > total) {
      setInputRelativityError(true);
    } else if (
      recovered !== undefined &&
      deaths !== undefined &&
      cases < recovered + deaths
    ) {
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
          valueEntered={model[props.firstKey] as number}
          inputRelativityError={inputRelativityError}
          onValueChange={(cases) => {
            checkInputRelativity(
              cases,
              model[props.secondKey] as number,
              model[props.thirdKey] as number,
              model[props.lastKey] as number,
            );
            updateModel({ [props.firstKey]: cases });
          }}
        />
      </InputCell>
      <InputCell>
        <InputTextNumeric
          type="number"
          valueEntered={model[props.secondKey] as number}
          inputRelativityError={inputRelativityError}
          onValueChange={(recovered) => {
            checkInputRelativity(
              model[props.firstKey] as number,
              recovered,
              model[props.thirdKey] as number,
              model[props.lastKey] as number,
            );
            updateModel({ [props.secondKey]: recovered });
          }}
        />
      </InputCell>
      <InputCell>
        <InputTextNumeric
          type="number"
          valueEntered={model[props.thirdKey] as number}
          inputRelativityError={inputRelativityError}
          onValueChange={(deaths) => {
            checkInputRelativity(
              model[props.firstKey] as number,
              model[props.secondKey] as number,
              deaths,
              model[props.lastKey] as number,
            );
            updateModel({ [props.thirdKey]: deaths });
          }}
        />
      </InputCell>
      <InputCell>
        <InputTextNumeric
          type="number"
          valueEntered={model[props.lastKey] as number}
          onValueChange={(total) => {
            checkInputRelativity(
              model[props.firstKey] as number,
              model[props.secondKey] as number,
              model[props.thirdKey] as number,
              total,
            );
            updateModel({ [props.lastKey]: total });
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
