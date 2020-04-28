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

const RtTimeseriesContainer: React.FC = () => {
  // TODO: to avoid repeated fetches in different parts of the UI,
  // this should probably be lifted out to a context somewhere?
  const [rtData, updateRtData] = useState<ChartData | undefined>();

  useEffect(() => {
    async function getRtData() {
      // TODO: get real input data from the database
      const fetchedData = await fetchRt({
        dates: [1587422775, 1587509175, 1587595575, 1587681975],
        cases: [5, 3, 0, 12],
      });

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
  }, []);

  return rtData ? <RtTimeseries data={rtData} /> : <Loading />;
};

export default RtTimeseriesContainer;
