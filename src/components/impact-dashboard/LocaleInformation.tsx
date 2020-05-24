import React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import LocaleDetails from "../../page-multi-facility/LocaleDetails";
import InputSelect from "../design-system/InputSelect";
import InputTextNumeric from "../design-system/InputTextNumeric";
import useModel from "./useModel";

const LocaleInformationDiv = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 24px;
  align-items: flex-end;
`;

const LocaleInputDiv = styled.div`
  flex: 0 1 auto;
`;

const LocaleInformation: React.FC = () => {
  const [model, updateModel] = useModel();

  const [stateList, updateStateList] = useState([{ value: "US Total" }]);
  const [countyList, updateCountyList] = useState([{ value: "Total" }]);

  useEffect(() => {
    if (typeof model.localeDataSource !== "undefined") {
      const newStateList = Array.from(model.localeDataSource.keys()).map(
        (key) => ({
          value: key,
        }),
      );
      updateStateList(newStateList);
    }
  }, [model.localeDataSource]);

  useEffect(() => {
    const localeDataSource = model.localeDataSource;
    const stateCode = model.stateCode;
    if (localeDataSource !== undefined && stateCode !== undefined) {
      // TODO: TS is complaining about things being undefined
      // despite the above checks; replace these assertions
      // with proper type guards
      const keys = localeDataSource?.get(stateCode)?.keys();
      const newCountyList = Array.from(
        keys as Iterable<string>,
      ).map((value) => ({ value }));
      updateCountyList(newCountyList);
    }
  }, [model.localeDataSource, model.stateCode]);

  return (
    <>
      <LocaleInformationDiv>
        <LocaleInputDiv>
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
        </LocaleInputDiv>
        <LocaleInputDiv>
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
        </LocaleInputDiv>
        <LocaleInputDiv>
          <InputTextNumeric
            type="number"
            labelAbove="Confirmed case count"
            labelHelp="Based on NYTimes data. Replace with your most up-to-date data."
            valueEntered={model.confirmedCases}
            onValueChange={(value) => updateModel({ confirmedCases: value })}
          />
        </LocaleInputDiv>
      </LocaleInformationDiv>
      <LocaleDetails
        stateCode={model.stateCode}
        countyName={model.countyName}
      />
    </>
  );
};

export default LocaleInformation;
