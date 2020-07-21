import { maxBy, minBy, orderBy } from "lodash";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { DateMMMMdyyyy } from "../design-system/DateFormats";
import InputSelect from "../design-system/InputSelect";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import {
  LocaleDataProvider,
  LocaleRecord,
  useLocaleDataState,
} from "../locale-data-context";
import LocaleStatsTable from "./LocaleStatsTable";
import {
  NYTCountyRecord,
  NYTData,
  NYTStateRecord,
  useNYTData,
} from "./NYTDataProvider";
import { UPDATE_STATE_NAME, useWeeklyReport } from "./weekly-report-context";

const stateNamesFilter = (key: string) =>
  !["US Total", "US Federal Prisons"].includes(key);

const LocaleStats = styled.div`
  display: flex;
`;
const LocaleStatsList = styled.ul``;

export default function LocaleSummary() {
  const { dispatch } = useWeeklyReport();
  const { data, loading: nytLoading } = useNYTData();
  const [selectedState, setSelectedState] = useState<NYTData | undefined>();
  const { data: localeData, loading } = useLocaleDataState();
  const stateNames = Array.from(localeData.keys()).filter(stateNamesFilter);
  const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stateName = event.target.value;

    dispatch({ type: UPDATE_STATE_NAME, payload: stateName });

    if (!nytLoading) {
      setSelectedState(data[stateName]);
    }
  };

  return (
    <LocaleDataProvider>
      {loading || nytLoading ? (
        <Loading />
      ) : (
        <PageContainer>
          <Column>
            <InputSelect
              label="State"
              placeholder="Select a state"
              onChange={handleOnChange}
            >
              <option value="">Select a state</option>
              {stateNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </InputSelect>
          </Column>
          <Column>
            <LocaleStatsTable
              stateName={selectedState?.state[0].stateName}
              stateNames={stateNames}
            />
          </Column>
        </PageContainer>
      )}
    </LocaleDataProvider>
  );
}
