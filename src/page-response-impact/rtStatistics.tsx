import { mean } from "lodash";

import { getNewestRt, getOldestRt, RtRecord } from "../infection-model/rt";

export function numFacilitiesWithRtLessThan1(
  facilitiesRtRecords: RtRecord[][],
) {
  const latestRtValues = facilitiesRtRecords.map((rtRecords) => {
    return getNewestRt(rtRecords)?.value;
  });
  return latestRtValues.filter((v) => v && v < 1).length;
}

export function averageRtReductionAcrossFacilities(
  facilitiesRtRecords: RtRecord[][],
) {
  const rtDifferences: (number | undefined)[] = facilitiesRtRecords.map(
    (rtRecords: RtRecord[]) => {
      const latestRtValue = getNewestRt(rtRecords)?.value;
      const oldestRtValue = getOldestRt(rtRecords)?.value;
      return latestRtValue && oldestRtValue && oldestRtValue - latestRtValue;
    },
  );
  return mean(rtDifferences);
}
