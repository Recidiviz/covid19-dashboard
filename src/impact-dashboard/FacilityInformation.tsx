import { isEqual, startOfDay } from "date-fns";
// import { useFacilities, getFacilityById } from "../facilities-context";
import startOfToday from "date-fns/startOfToday";
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
import { Facility, ModelInputs } from "../page-multi-facility/types";
import Description from "./Description";
import {
  EpidemicModelState,
  EpidemicModelUpdate,
} from "./EpidemicModelContext";
import { FormGrid, FormGridCell, FormGridRow } from "./FormGrid";
import useModel from "./useModel";
// import useFacilityModelVersions from "../hooks/useFacilityModelVersions";
// import facility from "../pages/facility";

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

function observedAtDateUsesReferenceData(
  observedAtDate: Date,
  facilityModelVersions: ModelInputs[] | undefined,
) {
  let usedReferenceData = false;
  if (facilityModelVersions) {
    // sort observed at dates
    const modelInputsSameDate = facilityModelVersions.filter(function (
      facility,
    ) {
      return (
        isEqual(startOfDay(observedAtDate), startOfDay(facility.observedAt)) &&
        facility.isReference
      );
    });
    usedReferenceData = modelInputsSameDate.length > 0;
  }
  return usedReferenceData;
}

interface AgeGroupGridProps {
  model: Partial<EpidemicModelState>;
  updateModel: (update: EpidemicModelUpdate) => void;
  collapsible?: boolean;
  warnedAt: number;
  setWarnedAt: (warnedAt: number) => void;
  updatedAt?: Date;
  facilityModelVersions?: ModelInputs[] | undefined;
  isReference?: boolean;
}

export const AgeGroupGrid: React.FC<AgeGroupGridProps> = ({
  collapsible = false,
  ...props
}) => {
  const [collapsed, setCollapsed] = useState(collapsible);

  // TODO: make default parameter
  const observedAt = props.updatedAt ? props.updatedAt : startOfToday();
  console.log(observedAt);

  const usedReferenceData = observedAtDateUsesReferenceData(
    observedAt,
    props.facilityModelVersions,
  );

  console.log(usedReferenceData);
  props.isReference = usedReferenceData;

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
        isReference={usedReferenceData}
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
  warnedAt: number;
  setWarnedAt: (warnedAt: number) => void;
  updatedAt?: Date;
  isReference?: boolean;
}

const AgeGroupRow: React.FC<AgeGroupRowProps> = (props) => {
  const { model, updateModel } = props;
  const [casesInputRelativityError, setCasesInputRelativityError] = useState(
    false,
  );
  const [
    recoveredInputRelativityError,
    setRecoveredInputRelativityError,
  ] = useState(false);
  const [deathsInputRelativityError, setDeathsInputRelativityError] = useState(
    false,
  );
  const { addToast } = useToasts();

  function checkCasesInputRelativity(
    cases: number | undefined,
    total: number | undefined,
  ) {
    if (cases === undefined) {
      setCasesInputRelativityError(false);
    } else if (cases !== undefined && total === undefined) {
      setCasesInputRelativityError(true);
    } else if (total !== undefined && cases > total) {
      setCasesInputRelativityError(true);
    } else {
      setCasesInputRelativityError(false);
    }
  }

  function checkRecoveredInputRelativity(
    cases: number | undefined,
    recovered: number | undefined,
    deaths: number | undefined,
  ) {
    if (recovered === undefined) {
      setRecoveredInputRelativityError(false);
    } else if (
      cases !== undefined &&
      recovered !== undefined &&
      deaths !== undefined &&
      cases < recovered + deaths
    ) {
      setRecoveredInputRelativityError(true);
    } else {
      setRecoveredInputRelativityError(false);
    }
  }

  function checkDeathsInputRelativity(
    cases: number | undefined,
    recovered: number | undefined,
    deaths: number | undefined,
  ) {
    if (deaths === undefined) {
      setDeathsInputRelativityError(false);
    } else if (
      cases !== undefined &&
      recovered !== undefined &&
      deaths !== undefined &&
      cases < recovered + deaths
    ) {
      setDeathsInputRelativityError(true);
    } else {
      setDeathsInputRelativityError(false);
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
          isReference={props.isReference}
          valueEntered={model[props.firstKey] as number}
          inputRelativityError={casesInputRelativityError}
          onValueChange={(cases) => {
            checkCasesInputRelativity(cases, model[props.lastKey] as number);
            updateModel({ [props.firstKey]: cases });
            checkAgeConflict(model);
          }}
        />
      </InputCell>
      <InputCell>
        <InputTextNumeric
          type="number"
          isReference={props.isReference}
          valueEntered={model[props.secondKey] as number}
          inputRelativityError={recoveredInputRelativityError}
          onValueChange={(recovered) => {
            checkRecoveredInputRelativity(
              model[props.firstKey] as number,
              recovered,
              model[props.thirdKey] as number,
            );
            updateModel({ [props.secondKey]: recovered });
            checkAgeConflict(model);
          }}
        />
      </InputCell>
      <InputCell>
        <InputTextNumeric
          type="number"
          isReference={props.isReference}
          valueEntered={model[props.thirdKey] as number}
          inputRelativityError={deathsInputRelativityError}
          onValueChange={(deaths) => {
            checkDeathsInputRelativity(
              model[props.firstKey] as number,
              model[props.secondKey] as number,
              deaths,
            );
            updateModel({ [props.thirdKey]: deaths });
            checkAgeConflict(model);
          }}
        />
      </InputCell>
      <InputCell>
        <InputTextNumeric
          type="number"
          isReference={props.isReference}
          valueEntered={model[props.lastKey] as number}
          onValueChange={(total) => {
            checkCasesInputRelativity(model[props.firstKey] as number, total);
            updateModel({ [props.lastKey]: total });
            checkAgeConflict(model);
          }}
        />
      </InputCell>
    </FormGridRow>
  );
};

interface Props {
  facility: Facility | undefined;
}

const FacilityInformation: React.FC<Props> = (props: Props) => {
  const [model, updateModel] = useModel();
  const [warnedAt, setWarnedAt] = useState(0);

  const facilityModelVersions = props.facility?.modelVersions;

  return (
    <FacilityInformationDiv>
      <div>
        <AgeGroupGrid
          model={model}
          updateModel={updateModel}
          warnedAt={warnedAt}
          setWarnedAt={setWarnedAt}
          facilityModelVersions={facilityModelVersions}
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
