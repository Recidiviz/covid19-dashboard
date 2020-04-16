import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../../design-system/Colors";
import InputSelect from "../../design-system/InputSelect";
import { useEpidemicModelState } from "../../impact-dashboard/EpidemicModelContext";
import LocaleInformation from "../../impact-dashboard/LocaleInformation";

const PageOneContainer = styled.div`
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

const PageOne: React.FC = () => {
  const { countyLevelDataFailed } = useEpidemicModelState();

  const systemTypeList = [{ value: "StatePrison" }, { value: "County Jail" }];

  return (
    <PageOneContainer>
      <Header>Locale Information</Header>
      <SystemTypeInputDiv>
        <InputSelect
          label="Type of System"
          value="State Prison"
          onChange={(event) => {
            console.log("updating type of system", event);
          }}
        >
          {systemTypeList.map(({ value }) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </InputSelect>
      </SystemTypeInputDiv>
      {countyLevelDataFailed ? (
        <ErrorMessage>Error: unable to load data!</ErrorMessage>
      ) : (
        <>
          <LocaleInformation />
        </>
      )}
    </PageOneContainer>
  );
};

export default PageOne;
