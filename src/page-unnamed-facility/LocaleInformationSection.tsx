import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputSelect from "../design-system/InputSelect";
import useModel from "../impact-dashboard/useModel";
import { FormGridRow } from "../impact-dashboard/FormGrid";
import InputTextNumeric from "../design-system/InputTextNumeric";

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

const LocaleInputDiv = styled.div`
  flex-grow: 1
`;

const defaultLocaleData = {
  type: '',
  state: '',
  count: undefined,
  county: ''
}

const LocaleInformationSection: React.FC = () => {
  const [model, _] = useModel();
  const systemTypeList = [{value: "Select..." }, { value: "State Prison" }, { value: "County Jail" }];
  const [stateList, updateStateList] = useState([{ value: 'Select a State'}]);
  const [countyList, updateCountyList] = useState([{ value: 'Select a County'}]);
  const [localeData, setLocaleData] = useState(defaultLocaleData)


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
    <LocaleInformationSectionDiv>
      <SectionHeader>Locale Information</SectionHeader>
      <FormGridRow>
        <LocaleInputDiv>
          <InputSelect
            label="Type of System"
            onChange={(event) => {setLocaleData({...localeData, type: event.target.value})}}
          >
            {systemTypeList.map(({ value }) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </InputSelect>
        </LocaleInputDiv>
        <LocaleInputDiv>
          <InputTextNumeric
            type="number"
            labelAbove="Confirmed case count"
            labelHelp="Based on NYTimes data. Replace with your most up-to-date data."
            valueEntered={localeData.count}
            onValueChange={(value) => {value && setLocaleData({...localeData, count: value})}}
          />
        </LocaleInputDiv>
      </FormGridRow>
      <FormGridRow>
        <LocaleInputDiv>
          <InputSelect
            label="State"
            onChange={(event) => {setLocaleData({...localeData, state: event.target.value})}}
          >
            {stateList.map(({ value }) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </InputSelect>
        </LocaleInputDiv>
        <LocaleInputDiv>
          <InputSelect
            label="County"
            onChange={(event) => {setLocaleData({...localeData, county: event.target.value})}}
          >
            {countyList.map(({ value }) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </InputSelect>
        </LocaleInputDiv>
      </FormGridRow>
    </LocaleInformationSectionDiv>
  );
};

export default LocaleInformationSection;
