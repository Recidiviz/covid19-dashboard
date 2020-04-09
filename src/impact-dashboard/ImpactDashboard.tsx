import { useEffect, useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputSelect from "../design-system/InputSelect";
import InputTextNumeric from "../design-system/InputTextNumeric";
import TextLabel from "../design-system/TextLabel";
import ChartArea from "./ChartArea";
import {
  EpidemicModelUpdate,
  useEpidemicModelDispatch,
  useEpidemicModelState,
} from "./EpidemicModelContext";
import ImpactProjectionTable from "./ImpactProjectionTableContainer";

const FormGrid = styled.div`
  width: 100%;
`;

/* Shared components */

const Table: React.FC = (props) => <FormGrid>{props.children}</FormGrid>;

const SectionHeader = styled.header`
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 16px;
  margin-bottom: 16px;
`;

const SubsectionHeader = styled.header`
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`;

const Description = styled.p`
  font-family: Poppins;
  font-style: normal;
  font-weight: normal;
  font-size: 11px;
  line-height: 16px;
  margin: 10px 0 20px 0;
`;

function useModel() {
  const dispatch = useEpidemicModelDispatch();
  const model = useEpidemicModelState();

  function updateModel(update: EpidemicModelUpdate) {
    dispatch({ type: "update", payload: update });
  }

  return [model, updateModel] as [typeof model, typeof updateModel];
}

/* Locale Information */

const LocaleInformationDiv = styled.div`
  display: flex;
  flex-direction: row;
`;

const LocaleInformation: React.FC = () => {
  const [model, updateModel] = useModel();

  const [stateList, updateStateList] = useState([{ value: "US Total" }]);
  const [countyList, updateCountyList] = useState([{ value: "Total" }]);

  useEffect(() => {
    if (typeof model.countyLevelData !== "undefined") {
      const newStateList = Array.from(
        model.countyLevelData.keys(),
      ).map((key) => ({ value: key }));
      updateStateList(newStateList);
    }
  }, [model.countyLevelData]);

  useEffect(() => {
    const countyLevelData = model.countyLevelData;
    const stateCode = model.stateCode;
    if (countyLevelData !== undefined && stateCode !== undefined) {
      // TODO: TS is complaining about things being undefined
      // despite the above checks; replace these assertions
      // with proper type guards
      const keys = countyLevelData?.get(stateCode)?.keys();
      const newCountyList = Array.from(
        keys as Iterable<string>,
      ).map((value) => ({ value }));
      updateCountyList(newCountyList);
    }
  }, [model.countyLevelData, model.stateCode]);

  return (
    <LocaleInformationDiv>
      <InputSelect
        label="State"
        value={model.stateCode}
        onChange={(event) => {
          updateModel({ stateCode: event.target.value });
        }}
      >
        {stateList.map(({ value }) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </InputSelect>
      <InputSelect
        label="County"
        value={model.countyName}
        onChange={(event) => {
          updateModel({
            stateCode: model.stateCode,
            countyName: event.target.value,
          });
        }}
      >
        {countyList.map(({ value }) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </InputSelect>
      <InputTextNumeric
        type="number"
        labelAbove="Confirmed case count"
        labelHelp="Based on NYTimes data. Replace with your most up-to-date data."
        valueEntered={model.confirmedCases}
        onValueChange={(value) => updateModel({ confirmedCases: value })}
      />
    </LocaleInformationDiv>
  );
};

/* Facility Customization */

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

const FormHeaderRow: React.FC = () => (
  <FormRowWrapper labelsOnly>
    <LabelCell />
    <InputCell>
      <TextLabel>Current Cases</TextLabel>
    </InputCell>
    <InputCell>
      <TextLabel>Total Population</TextLabel>
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

const FacilityInformationDiv = styled.div`
  border-right: 1px solid ${Colors.grey};
  padding-right: 25px;
`;

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
        <Table>
          <FormHeaderRow />
          <FormRow
            label="Facility Staff"
            leftKey="staffCases"
            rightKey="staffPopulation"
          />
          <tr />
          <FormHeaderRow />
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
        </Table>
        <Table>
          <BottomRow />
        </Table>
      </div>
    </FacilityInformationDiv>
  );
};

/* Charts */

const ChartsContainer = styled.div`
  flex: 2 0 auto;
  width: 350px;
  margin: 0 15px;
`;

const ErrorMessage = styled.div`
  margin: 10px;
`;

const ImpactDashboardVDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const FormColumn = styled.div`
  flex: 1 0 auto;
  width: 350px;
`;

const ImpactDashboard: React.FC = () => {
  const { countyLevelDataFailed } = useEpidemicModelState();
  return (
    <div>
      {countyLevelDataFailed ? (
        <ErrorMessage>Error: unable to load data!</ErrorMessage>
      ) : (
        <>
          <SectionHeader>Locale Information</SectionHeader>
          <LocaleInformation />
          <SectionHeader>Facility Customization</SectionHeader>
          <ImpactDashboardVDiv>
            <FormColumn>
              <SubsectionHeader>Facility Information</SubsectionHeader>
              <FacilityInformation />
            </FormColumn>
            <ChartsContainer>
              <ChartArea />
              <ImpactProjectionTable />
            </ChartsContainer>
          </ImpactDashboardVDiv>
        </>
      )}
    </div>
  );
};

export default ImpactDashboard;
