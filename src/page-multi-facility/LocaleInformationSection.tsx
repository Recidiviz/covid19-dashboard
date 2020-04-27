import React from "react";
import styled from "styled-components";

import InputSelect from "../design-system/InputSelect";
import LocaleInformation from "../impact-dashboard/LocaleInformation";
import { SectionHeader } from "./FacilityInputForm";

const LocaleInformationSectionDiv = styled.div``;

const SystemTypeInputDiv = styled.div`
  width: 195px;
  padding-bottom: 20px;
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
