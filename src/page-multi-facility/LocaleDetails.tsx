import numeral from "numeral";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import {
  LocaleDataProvider,
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

const localeData: { [key: string]: string | undefined } = {
  "Population": "totalIncarceratedPopulation",
  "Cases": "reportedCases",
  "Likely Cases": "estimatedIncarceratedCases",
  "Hospital Beds": "hospitalBeds",
  "ICU Beds": undefined,
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
  const locale: LocaleRecord | undefined =
    stateData && stateData.get(countyName);

  return (
    <LocaleDataProvider>
      <LocaleDetailsContainer>
        {locale &&
          Object.keys(localeData).map((detail) => {
            const property = localeData[detail] as keyof LocaleRecord;
            const value =
              property && locale[property]
                ? numeral(locale[property]).format("0,0")
                : enDash;

            return (
              <LocaleDetail key={`LocaleDetail-${property}`}>
                <LocaleDetailValue>{value}</LocaleDetailValue>
                <LocaleDetailDescription>{detail}</LocaleDetailDescription>
              </LocaleDetail>
            );
          })}
      </LocaleDetailsContainer>
    </LocaleDataProvider>
  );
};

export default LocaleDetails;
