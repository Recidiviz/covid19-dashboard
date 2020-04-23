import { ascending, isoParse } from "d3";
import mapValues from "lodash/mapValues";

import RtTimeseries, { Record } from "./RtTimeseries";

type RawRecord = {
  date: string;
  value: number;
};

const convertToDate = isoParse;

function dateExists(value: { date: Date | null }): value is Record {
  // date formatting function may return null with invalid input
  // so we do need a type guard to filter the results
  return value.date != null;
}

const RtTimeseriesContainer: React.FC = () => {
  // TODO: uncomment dummy data for local testing
  // TODO: get rid of this fake data when real data is wired up!
  const rawData = {
    Rt: [
      // { date: "2020-04-02T00:00:00.000Z", value: 3.0 },
      // { date: "2020-04-03T00:00:00.000Z", value: 3.01 },
      // { date: "2020-04-04T00:00:00.000Z", value: 2.67 },
      // { date: "2020-04-05T00:00:00.000Z", value: 2.87 },
      // { date: "2020-04-06T00:00:00.000Z", value: 2.9 },
      // { date: "2020-04-07T00:00:00.000Z", value: 3.57 },
      // { date: "2020-04-08T00:00:00.000Z", value: 3.6 },
      // { date: "2020-04-09T00:00:00.000Z", value: 3.25 },
      // { date: "2020-04-10T00:00:00.000Z", value: 2.85 },
      // { date: "2020-04-11T00:00:00.000Z", value: 2.49 },
      // { date: "2020-04-12T00:00:00.000Z", value: 2.17 },
      // { date: "2020-04-13T00:00:00.000Z", value: 2.05 },
      // { date: "2020-04-14T00:00:00.000Z", value: 2.1 },
      // { date: "2020-04-15T00:00:00.000Z", value: 2.17 },
      // { date: "2020-04-16T00:00:00.000Z", value: 2.23 },
      // { date: "2020-04-20T00:00:00.000Z", value: 2.17 },
    ] as RawRecord[],
    low90: [
      // { date: "2020-04-02T00:00:00.000Z", value: 0.01 },
      // { date: "2020-04-03T00:00:00.000Z", value: 0.09 },
      // { date: "2020-04-04T00:00:00.000Z", value: 0.05 },
      // { date: "2020-04-05T00:00:00.000Z", value: 1.22 },
      // { date: "2020-04-06T00:00:00.000Z", value: 1.3 },
      // { date: "2020-04-07T00:00:00.000Z", value: 2.01 },
      // { date: "2020-04-08T00:00:00.000Z", value: 2.23 },
      // { date: "2020-04-09T00:00:00.000Z", value: 2.11 },
      // { date: "2020-04-10T00:00:00.000Z", value: 1.84 },
      // { date: "2020-04-11T00:00:00.000Z", value: 1.56 },
      // { date: "2020-04-12T00:00:00.000Z", value: 1.31 },
      // { date: "2020-04-13T00:00:00.000Z", value: 1.27 },
      // { date: "2020-04-14T00:00:00.000Z", value: 1.35 },
      // { date: "2020-04-15T00:00:00.000Z", value: 1.47 },
      // { date: "2020-04-16T00:00:00.000Z", value: 1.56 },
      // { date: "2020-04-20T00:00:00.000Z", value: 1.55 },
    ] as RawRecord[],
    high90: [
      // { date: "2020-04-02T00:00:00.000Z", value: 6.99 },
      // { date: "2020-04-03T00:00:00.000Z", value: 5.95 },
      // { date: "2020-04-04T00:00:00.000Z", value: 5.05 },
      // { date: "2020-04-05T00:00:00.000Z", value: 5.03 },
      // { date: "2020-04-06T00:00:00.000Z", value: 4.77 },
      // { date: "2020-04-07T00:00:00.000Z", value: 5.28 },
      // { date: "2020-04-08T00:00:00.000Z", value: 4.99 },
      // { date: "2020-04-09T00:00:00.000Z", value: 4.45 },
      // { date: "2020-04-10T00:00:00.000Z", value: 3.88 },
      // { date: "2020-04-11T00:00:00.000Z", value: 3.4 },
      // { date: "2020-04-12T00:00:00.000Z", value: 3.02 },
      // { date: "2020-04-13T00:00:00.000Z", value: 2.9 },
      // { date: "2020-04-14T00:00:00.000Z", value: 2.9 },
      // { date: "2020-04-15T00:00:00.000Z", value: 2.94 },
      // { date: "2020-04-16T00:00:00.000Z", value: 2.94 },
      // { date: "2020-04-20T00:00:00.000Z", value: 2.85 },
    ] as RawRecord[],
  };
  // convert strings to Dates
  // TODO: presumably we will have to do this with real data also
  const data = mapValues(rawData, (records) =>
    records
      .map(({ date, value }) => ({ date: convertToDate(date), value }))
      // ensure there are no null dates
      .filter(dateExists)
      // ensure records are sorted chronologically
      .sort((a, b) => ascending(a.date, b.date)),
  );

  return <RtTimeseries data={data} />;
};

export default RtTimeseriesContainer;
