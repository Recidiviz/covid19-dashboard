import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputSelect from "../design-system/InputSelect";
import LocaleInformation from "../impact-dashboard/LocaleInformation";

const borderStyle = `1px solid ${Colors.paleGreen}`;

const LocaleInformationSectionDiv = styled.div`
  border-top: ${borderStyle};
`;
const SystemTypeInputDiv = styled.div``;
const SectionHeader = styled.header`
  font-family: Poppins;
  font-weight: 400;
  font-size: 16px;
  line-height: 16px;
  padding: 20px 0;
  color: "${Colors.forest}"
`;

const LocaleInformationSection: React.FC = () => {
  const systemTypeList = [{ value: "State Prison" }, { value: "County Jail" }];
  const [systemType, updateSystemType] = useState(systemTypeList[0].value);

  return (
    <LocaleInformationSectionDiv>
      <SectionHeader>Locale Information</SectionHeader>
      <SystemTypeInputDiv>
        <InputSelect
          label="Type of System"
          value={systemType}
          onChange={(event) => {
            updateSystemType(event.target.value);
          }}
        >
          {systemTypeList.map(({ value }) => (
            <option key={value} value={value}>
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
