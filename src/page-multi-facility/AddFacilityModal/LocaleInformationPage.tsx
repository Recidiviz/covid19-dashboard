import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../../design-system/Colors";
import InputSelect from "../../design-system/InputSelect";
import { useEpidemicModelState } from "../../impact-dashboard/EpidemicModelContext";
import LocaleInformation from "../../impact-dashboard/LocaleInformation";

const LocaleInformationContainer = styled.div`
  width: 100%;
  flex: 1 1;
`;

const SystemTypeInputDiv = styled.div`
  width: 195px;
  padding-bottom: 20px;
`;

const Header = styled.header`
  font-family: Poppins;
  font-weight: 400;
  font-size: 16px;
  line-height: 16px;
  padding: 20px 0;
  color: "${Colors.forest}"
`;

const ErrorMessage = styled.div`
  margin: 10px;
`;

const LocaleInformationPage: React.FC = () => {
  const { countyLevelDataFailed } = useEpidemicModelState();

  const systemTypeList = [{ value: "State Prison" }, { value: "County Jail" }];
  const [systemType, updateSystemType] = useState(systemTypeList[0].value);

  return (
    <LocaleInformationContainer>
      <Header>Locale Information</Header>
      {countyLevelDataFailed ? (
        <ErrorMessage>Error: unable to load data!</ErrorMessage>
      ) : (
        <>
          <SystemTypeInputDiv>
            <InputSelect
              label="Type of System"
              value={systemType}
              onChange={(event) => {
                updateSystemType(event.target.value)
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
        </>
      )}
    </LocaleInformationContainer>
  );
};

export default LocaleInformationPage;
