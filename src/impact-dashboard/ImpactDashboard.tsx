import { pick } from "lodash";
import { useEffect, useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputSelect from "../design-system/InputSelect";
import InputTextNumeric from "../design-system/InputTextNumeric";
import TextLabel from "../design-system/TextLabel";
import useQueryParams from "../hooks/useQueryParams";
import ChartArea from "./ChartArea";
import {
  EpidemicModelUpdate,
  urlParamKeys,
  useEpidemicModelDispatch,
  useEpidemicModelState,
} from "./EpidemicModelContext";
import ImpactProjectionTable from "./ImpactProjectionTableContainer";

/* Shared components */

const Table: React.FC = (props) => (
  <table>
    <tbody>{props.children}</tbody>
  </table>
);

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
`;

function useModel() {
  const dispatch = useEpidemicModelDispatch();
  const model = useEpidemicModelState();

  const { values, replaceValues } = useQueryParams({});

  function updateModel(update: EpidemicModelUpdate) {
    // on updates, replace the URL state
    const urlParams = Object.assign({}, values, pick(update, urlParamKeys));
    replaceValues(urlParams);

    dispatch({ type: "update", payload: update });
  }

  function resetModel(stateCode?: string, countyName?: string) {
    dispatch({
      type: "reset",
      payload: Object.assign(
        { dataSource: model.countyLevelData },
        { stateCode, countyName },
      ),
    });
  }

  return [model, updateModel, resetModel] as [
    typeof model,
    typeof updateModel,
    typeof resetModel,
  ];
}

/* Locale Information */

const LocaleInformationDiv = styled.div`
  display: flex;
  flex-direction: row;
`;

const LocaleInformation: React.FC = () => {
  const [model, updateModel, resetModel] = useModel();

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
          resetModel(event.target.value);
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
          resetModel(model.stateCode, event.target.value);
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

const FormHeaderRow: React.FC = () => (
  <tr>
    <td />
    <td>
      <TextLabel>Current Cases</TextLabel>
    </td>
    <td>
      <TextLabel>Total Population</TextLabel>
    </td>
  </tr>
);

interface FormRowProps {
  label: string;
  leftKey: keyof EpidemicModelUpdate;
  rightKey: keyof EpidemicModelUpdate;
}

const FormRow: React.FC<FormRowProps> = (props) => {
  const [model, updateModel] = useModel();

  return (
    <tr>
      <td>
        <TextLabel>{props.label}</TextLabel>
      </td>
      <td>
        <InputTextNumeric
          type="number"
          valueEntered={model[props.leftKey] as number}
          onValueChange={(value) => updateModel({ [props.leftKey]: value })}
        />
      </td>
      <td>
        <InputTextNumeric
          type="number"
          valueEntered={model[props.rightKey] as number}
          onValueChange={(value) => updateModel({ [props.rightKey]: value })}
        />
      </td>
    </tr>
  );
};

const BottomRow: React.FC = () => {
  const [model, updateModel] = useModel();

  return (
    <tr>
      <td>
        <InputTextNumeric
          type="percent"
          labelAbove="Capacity"
          labelHelp="Enter population as a percent of facility built capacity."
          valueEntered={model.facilityOccupancyPct}
          onValueChange={(value) =>
            updateModel({ facilityOccupancyPct: value })
          }
        />
      </td>
      <td>
        <InputTextNumeric
          type="percent"
          labelAbove="Bunk-Style Housing"
          labelHelp="Enter the percent of facility in dormitory bunk style housing."
          valueEntered={model.facilityDormitoryPct as number}
          onValueChange={(value) =>
            updateModel({ facilityDormitoryPct: value })
          }
        />
      </td>
    </tr>
  );
};

const FacilityInformationDiv = styled.div`
  border-right: 1px solid ${Colors.grey};
  flex: 1 0 auto;
  padding-right: 25px;
  min-width: 250px;
  max-width: 600px;
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
            <div>
              <SubsectionHeader>Facility Information</SubsectionHeader>
              <FacilityInformation />
            </div>
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
