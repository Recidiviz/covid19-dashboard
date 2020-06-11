import { maxBy, minBy } from "lodash";
import numeral from "numeral";
import React, { useState } from "react";
import styled from "styled-components";

import { DateMMMMdyyyy } from "../design-system/DateFormats";
import InputSelect from "../design-system/InputSelect";
import Loading from "../design-system/Loading";
import { LocaleDataProvider, useLocaleDataState } from "../locale-data-context";
import { NYTData, NYTStateRecord, useNYTData } from "./NYTDataProvider";

const stateNamesFilter = (key: string) =>
  !["US Total", "US Federal Prisons"].includes(key);
const formatNumber = (number: number) => numeral(number).format("0,0");

const LocaleStats = styled.div`
  display: flex;
`;
const LocaleStatsList = styled.ul``;

export default function WeeklySnapshotPage() {
  const { data, loading: nytLoading } = useNYTData();
  console.log({ data });
  const [selectedState, setSelectedState] = useState<NYTData | undefined>();
  const { data: localeData, loading } = useLocaleDataState();
  const stateNames = Array.from(localeData.keys()).filter(stateNamesFilter);

  const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stateName = event.target.value;
    if (!nytLoading) {
      setSelectedState(data[stateName]);
    }
  };

  const dayOne =
    selectedState &&
    minBy(selectedState.state, (state: NYTStateRecord) => state.date);
  const daySeven =
    selectedState &&
    maxBy(selectedState.state, (state: NYTStateRecord) => state.date);
  const sevenDayDiffInCases =
    daySeven && dayOne && daySeven.cases - dayOne.cases;
  const total =
    dayOne && dayOne.state && localeData?.get(dayOne.state)?.get("Total");
  const totalBeds = total && total.icuBeds + total.hospitalBeds;

  return (
    <LocaleDataProvider>
      {loading || nytLoading ? (
        <Loading />
      ) : (
        <>
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
          {selectedState && (
            <LocaleStats>
              <LocaleStatsList>
                <li>
                  Latest Date:{" "}
                  {daySeven && <DateMMMMdyyyy date={daySeven.date} />}
                </li>
                <li>
                  Number of cases in the state:{" "}
                  {daySeven ? formatNumber(daySeven.cases) : "?"}
                </li>
                <li>
                  Change in state cases since last week:{" "}
                  {sevenDayDiffInCases || sevenDayDiffInCases === 0
                    ? formatNumber(sevenDayDiffInCases)
                    : "?"}
                </li>
                <li>
                  Number of ICU and hospital beds in state:{" "}
                  {totalBeds || totalBeds === 0 ? formatNumber(totalBeds) : "?"}
                </li>
                <li>Counties to watch: </li>
              </LocaleStatsList>
            </LocaleStats>
          )}
        </>
      )}
    </LocaleDataProvider>
  );
}
