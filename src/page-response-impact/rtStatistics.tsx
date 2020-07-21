import { isThisWeek } from "date-fns";
import { mean } from "lodash";

import {
  getNewestRt,
  getOldestRt,
  getPrevWeekRt,
  RtRecord,
} from "../infection-model/rt";

export function numFacilitiesWithRtLessThan1(
  facilitiesRtRecords: RtRecord[][],
) {
  const latestRtValues = facilitiesRtRecords.map((rtRecords) => {
    return getNewestRt(rtRecords)?.value;
  });
  return latestRtValues.filter((v) => v !== undefined && v < 1).length;
}

export function numFacilitiesWithRtGreaterThan1ThisWeek(
  facilitiesRtRecords: RtRecord[][],
) {
  const rtValuesThisWeek = facilitiesRtRecords.filter((rtRecords) => {
    const newestRt = getNewestRt(rtRecords);
    return newestRt && isThisWeek(newestRt.date);
  });

  const latestRtValues = rtValuesThisWeek.map((rtRecords) => {
    return getNewestRt(rtRecords)?.value;
  });
  return latestRtValues.filter((date, v) => v !== undefined && v > 1).length;
}

export function numFacilitiesWithRtGreaterThan1PrevWeek(
  facilitiesRtRecords: RtRecord[][],
) {
  const latestRtValues = facilitiesRtRecords.map((rtRecords) => {
    return getPrevWeekRt(rtRecords)?.value;
  });
  return latestRtValues.filter((date, v) => v !== undefined && v > 1).length;
}

export function averageRtReductionAcrossFacilities(
  facilitiesRtRecords: RtRecord[][],
) {
  const rtDifferences: (number | undefined)[] = facilitiesRtRecords.map(
    (rtRecords: RtRecord[]) => {
      const latestRtValue = getNewestRt(rtRecords)?.value;
      const oldestRtValue = getOldestRt(rtRecords)?.value;
      if (latestRtValue === undefined || oldestRtValue === undefined) return;
      return oldestRtValue - latestRtValue;
    },
  );
  return mean(rtDifferences);
}
