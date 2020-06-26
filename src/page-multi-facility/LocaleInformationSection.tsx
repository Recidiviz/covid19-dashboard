import React from "react";
import styled from "styled-components";

import InputSelect from "../design-system/InputSelect";
import LocaleInformation from "../impact-dashboard/LocaleInformation";
import { SectionHeader } from "./FacilityInputForm";
import SystemTypeSelection from "./SystemTypeSelection";

const LocaleInformationSectionDiv = styled.div``;

interface Props {
  systemType?: string;
  setSystemType: (systemType?: string) => void;
}

const LocaleInformationSection: React.FC<Props> = ({
  systemType,
  setSystemType,
}) => {
  return (
    <LocaleInformationSectionDiv>
      <SectionHeader>Locale Information</SectionHeader>
      <SystemTypeSelection
        systemType={systemType}
        setSystemType={setSystemType}
      />
      <LocaleInformation />
    </LocaleInformationSectionDiv>
  );
};

export default LocaleInformationSection;
