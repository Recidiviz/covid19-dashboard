import React, { useState } from "react";

import InputSelect from "../design-system/InputSelect";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import { LocaleDataProvider, useLocaleDataState } from "../locale-data-context";
import LocaleSummaryTable from "./LocaleSummaryTable";
import { NYTData, useNYTData } from "./NYTDataProvider";
import { UPDATE_STATE_NAME, useWeeklyReport } from "./weekly-report-context";

const stateNamesFilter = (key: string) =>
  !["US Total", "US Federal Prisons"].includes(key);

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
            <br />
            This snapshot is based on a standard SEIR model for COVID-19
            epidemiology that factors in criminal justice facility variables.
            This page shows where your Corrections system stands compared to
            your state overall and how your interventions have flattened the
            curve in your facilities.
            {/* TODO: there's probably a better way to do this... */}
            <br />
            <br />
            The subsequent page(s) project the spread of COVID-19 in your
            facilities as well as likely impact on metrics like # of staff
            unable to work. All projections and analysis are based on publicly
            available data or data your state has entered on
            model.recidiviz.org.
          </Column>
          <Column>
            <LocaleSummaryTable
              stateName={selectedState?.state[0].stateName}
              stateNames={stateNames}
            />
          </Column>
        </PageContainer>
      )}
    </LocaleDataProvider>
  );
}
