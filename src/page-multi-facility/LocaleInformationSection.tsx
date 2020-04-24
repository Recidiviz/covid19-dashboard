import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputSelect from "../design-system/InputSelect";
import LocaleInformation from "../impact-dashboard/LocaleInformation";

const borderStyle = `1px solid ${Colors.paleGreen}`;

const LocaleInformationSectionDiv = styled.div`
  border-top: ${borderStyle};
`;

const SystemTypeInputDiv = styled.div`
  width: 195px;
  padding-bottom: 20px;
`;

const SectionHeader = styled.header`
  font-family: Libre Baskerville;
  font-weight: normal;
  font-size: 19px;
  line-height: 24px;
  padding: 20px 0;
  color: ${Colors.forest};
  letter-spacing: -0.06em;
`;

interface Props {
  systemType?: string;
  setSystemType: (systemType?: string) => void;
}

const LocaleInformationSection: React.FC<Props> = ({
  systemType,
  setSystemType,
}) => {
  const systemTypeList = [
    { value: undefined },
    { value: "State Prison" },
    { value: "County Jail" },
  ];

  return (
    <LocaleInformationSectionDiv>
      <SectionHeader>Locale Information</SectionHeader>
      <SystemTypeInputDiv>
        <InputSelect
          label="Type of System"
          value={systemType}
          onChange={(event) => setSystemType(event.target.value)}
        >
          {systemTypeList.map(({ value }, index) => (
            <option key={value || `system-type-${index}`} value={value}>
              {value}
            </option>
          ))}
        </InputSelect>
      </SystemTypeInputDiv>
      <LocaleInformation />
    </LocaleInformationSectionDiv>
  );
};

export default LocaleInformationSection;
