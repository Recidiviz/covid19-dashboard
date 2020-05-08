import { orderBy, pickBy } from "lodash";
import React, { useContext, useEffect, useState } from "react";

import { getDaysAgoRt } from "../infection-model/rt";
import { FacilityContext } from "../page-multi-facility/FacilityContext";
import { Facilities } from "../page-multi-facility/types";
import RtComparisonChart, {
  isRtComparisonData,
  RtComparisonData,
} from "./RtComparisonChart";

const RtComparisonChartContainer: React.FC<{
  facilities: Facilities;
  rtDaysOffset: number;
}> = ({ facilities, rtDaysOffset }) => {
  const { rtData: rtDataMapping } = useContext(FacilityContext);
  const [chartData, updateChartData] = useState([] as RtComparisonData[]);

  useEffect(() => {
    // when the offset changes, reset chart data state to force recomputation
    updateChartData([]);
  }, [rtDaysOffset]);

  useEffect(
    () => {
      const existingIds = chartData.map((record) => record.id);
      const newData = pickBy(
        rtDataMapping,
        (value, key) => !existingIds.includes(key),
      );
      const newRecords = Object.entries(newData)
        .map(([key, rtData]) => {
          const facility = facilities.find((f) => f.id === key);
          if (!facility) return;
          const values = {} as any;
          if (rtData) {
            Object.entries(rtData).forEach(([metric, records]) => {
              const rtRecord = getDaysAgoRt(records, rtDaysOffset);
              values[metric] = rtRecord?.value;
            });
          }
          return {
            name: facility.name,
            id: key,
            values,
          };
        })
        .filter(isRtComparisonData);

      if (newRecords.length) {
        updateChartData(orderBy([...chartData, ...newRecords], ["values.Rt"]));
      }
    },
    // change in rtDaysOffset triggers a state reset
    // so it should be safe to exclude here;
    // we don't want to display a mix of data from different days
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [facilities, rtDataMapping, chartData],
  );

  return <RtComparisonChart data={chartData} />;
};

export default RtComparisonChartContainer;
