import numeral from "numeral";
import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import {
  LocaleRecord,
  useLocaleDataState,
} from "../locale-data-context/LocaleDataContext";

const LocaleDetailsContainer = styled.div`
  color: ${Colors.green};
  display: flex;
  flex-flow: row nowrap;
  line-height: 150%;
  letter-spacing: -0.02em;
  margin: 2em 0;
`;

const LocaleDetail = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 32px;
`;

const LocaleDetailValue = styled.div`
  font-family: "Poppins", sans serif;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const LocaleDetailDescription = styled.div`
  font-family: "Helvetica";
  font-size: 13px;
  font-weight: normal;
`;

const localeRecordProperties: { [key: string]: keyof LocaleRecord } = {
  "Population": "totalIncarceratedPopulation",
  "Cases": "reportedCases",
  "Likely Cases": "estimatedIncarceratedCases",
  "Hospital Beds": "hospitalBeds",
  "ICU Beds": "icuBeds",
};

const enDash = "–";

interface Props {
  stateCode: string;
  countyName?: string;
}

const LocaleDetails: React.FC<Props> = ({ stateCode, countyName }) => {
  const { data } = useLocaleDataState();
  if (!data || !stateCode || !countyName) return null;

  const stateData = data.get(stateCode);
  const localeRecord: LocaleRecord | undefined =
    stateData && stateData.get(countyName);

  return (
    <LocaleDetailsContainer>
      {localeRecord &&
        Object.keys(localeRecordProperties).map((headerText: string) => {
          const property = localeRecordProperties[headerText];
          const value = localeRecord[property]
            ? numeral(localeRecord[property]).format("0,0")
            : enDash;

          return (
            <LocaleDetail key={`LocaleDetail-${property}`}>
              <LocaleDetailValue>{value}</LocaleDetailValue>
              <LocaleDetailDescription>{headerText}</LocaleDetailDescription>
            </LocaleDetail>
          );
        })}
    </LocaleDetailsContainer>
  );
};

export default LocaleDetails;
