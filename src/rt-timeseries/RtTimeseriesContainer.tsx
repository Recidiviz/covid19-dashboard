import { ascending } from "d3";
import fromUnixTime from "date-fns/fromUnixTime";
import mapValues from "lodash/mapValues";
import React, { useEffect, useState } from "react";

import Loading from "../design-system/Loading";
import fetchRt from "../infection-model/fetchRt";
import RtTimeseries, { ChartData } from "./RtTimeseries";

const convertToDate = (timestamp: number) => {
  return fromUnixTime(timestamp);
};

interface Props {
  dates: number[];
  cases: number[];
}

const RtTimeseriesContainer: React.FC<Props> = ({ dates, cases }) => {
  const [rtData, updateRtData] = useState<ChartData | undefined>();

  useEffect(() => {
    async function getRtData() {
      const fetchedData = await fetchRt({ dates, cases });

      const cleanData = mapValues(fetchedData, (records) =>
        records
          .map(({ date, value }) => ({
            date: convertToDate(date),
            value,
          }))
          // ensure records are sorted chronologically
          .sort((a, b) => ascending(a.date, b.date)),
      );
      updateRtData(cleanData);
    }
    getRtData();
  }, [dates, cases]);

  return rtData ? <RtTimeseries data={rtData} /> : <Loading />;
};

export default RtTimeseriesContainer;
