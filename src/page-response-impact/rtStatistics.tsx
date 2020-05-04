import { RtRecord } from "../infection-model/rt";

export function numFacilitiesWithRtLessThan1(
  facilitiesRtRecords: RtRecord[][],
) {
  const latestRtValues = facilitiesRtRecords.map((rtRecords) => {
    // Note: This assumes the first in the array is the latest because of the
    // sorting on line 104 in infection-model/rt.tsx
    return rtRecords[0].value;
  });
  return latestRtValues.filter((v) => v < 1).length;
}

export function averageRtReductionAcrossFacilities(
  facilitiesRtRecords: RtRecord[][],
) {
  const numFacilities = facilitiesRtRecords.length;
  const rtDifferences: number[] = facilitiesRtRecords.map(
    (rtRecords: RtRecord[]) => {
      const latestRtValue = rtRecords[0].value;
      const oldestRtValue = rtRecords[rtRecords.length - 1].value;
      return oldestRtValue - latestRtValue;
    },
  );
  const sumDifferences = rtDifferences.reduce(
    (sum, rtDifference) => sum + rtDifference,
    0,
  );
  return sumDifferences / numFacilities;
}
