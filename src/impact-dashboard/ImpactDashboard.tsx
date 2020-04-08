import styled from "styled-components";

import Colors from "../design-system/Colors";
import HelpButtonWithTooltip from "../design-system/HelpButtonWithTooltip";
import InputSelect from "../design-system/InputSelect";
import InputTextNumeric from "../design-system/InputTextNumeric";
import TextLabel from "../design-system/TextLabel";
import Tooltip from "../design-system/Tooltip";
import ChartArea from "./ChartArea";
import { useEpidemicModelState } from "./EpidemicModelContext";
import ImpactProjectionTable from "./ImpactProjectionTableContainer";

/* Shared components */

const Table: React.FC = (props) => (
  <table>
    <tbody>{props.children}</tbody>
  </table>
);

const VDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

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

/* Locale Information */

const LocaleInformation: React.FC = () => (
  <VDiv>
    <InputSelect label="Type of system" onChange={() => undefined}>
      <></>
    </InputSelect>
    <InputSelect label="State" onChange={() => undefined}>
      <></>
    </InputSelect>
    <InputSelect label="County" onChange={() => undefined}>
      <></>
    </InputSelect>
    <InputTextNumeric type="number" label="Confirmed case count" />
  </VDiv>
);

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
}

const FormRow: React.FC<FormRowProps> = (props) => (
  <tr>
    <td>
      <TextLabel>{props.label}</TextLabel>
    </td>
    <td>
      <InputTextNumeric type="number" />
    </td>
    <td>
      <InputTextNumeric type="number" />
    </td>
  </tr>
);

const FacilityInformationDiv = styled.div`
  border-right: 1px solid ${Colors.grey};
  flex: 1 0 auto;
  padding-right: 25px;
  min-width: 250px;
  max-width: 600px;
`;

const FacilityInformation: React.FC = () => (
  <FacilityInformationDiv>
    <Tooltip content="filler">
      <button>hover here</button>
    </Tooltip>
    <Description>
      This section collects basic information about facility staff and your
      incarcerated population by age and medical vulnerability. If you don't
      have your in-facility population available by age brackets, enter your
      overall population count in "Age unknown".
    </Description>
    <div>
      <Table>
        <FormHeaderRow />
        <FormRow label="Facility Staff" />
        <tr />
        <FormHeaderRow />
        <FormRow label="Ages Unknown" />
        <FormRow label="Ages 0-19" />
        <FormRow label="Ages 20-44" />
        <FormRow label="Ages 45-54" />
        <FormRow label="Ages 55-64" />
        <FormRow label="Ages 65-74" />
        <FormRow label="Ages 75-84" />
        <FormRow label="Ages 85+" />
      </Table>
      <Table>
        <tr>
          <td>
            <InputTextNumeric type="percent" label="Capacity" />
          </td>
          <td>
            <InputTextNumeric type="percent" label="Bunk-Style Housing" />
          </td>
        </tr>
      </Table>
    </div>
  </FacilityInformationDiv>
);

/* Charts */

const ChartsContainer = styled.div`
  flex: 2 0 auto;
  width: 350px;
  margin: 0 15px;
`;

const ErrorMessage = styled.div`
  margin: 10px;
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
          <HelpButtonWithTooltip />
          <VDiv>
            <div>
              <SubsectionHeader>Facility Information</SubsectionHeader>
              <FacilityInformation />
            </div>
            <ChartsContainer>
              <ChartArea />
              <ImpactProjectionTable />
            </ChartsContainer>
          </VDiv>
        </>
      )}
    </div>
  );
};

export default ImpactDashboard;
