import React from "react";

import { RtData, RtRecord } from "../infection-model/rt";
import * as rtStats from "./rtStatistics";

interface Props {
  rtFacilitiesData: (RtData | null)[];
}

function filterRtData(data: RtData | null): data is RtData {
  return data !== null;
}

const RtSummaryStats: React.FC<Props> = ({ rtFacilitiesData }) => {
  const facilitiesRtRecords: RtRecord[][] = rtFacilitiesData
    .filter(filterRtData)
    .map((rtData) => rtData.Rt);
  const numFacilities = facilitiesRtRecords.length;
  const numFacilitiesWithRtLessThan1 = rtStats.numFacilitiesWithRtLessThan1(
    facilitiesRtRecords,
  );
  const averageRtReductionAcrossFacilities = rtStats.averageRtReductionAcrossFacilities(
    facilitiesRtRecords,
  );
  const maxRtChange = rtStats.maxRtChange(facilitiesRtRecords);
  return (
    <div>
      <p className="mt-5 mb-5">{`${numFacilitiesWithRtLessThan1} of ${numFacilities} facilities currently ${
        numFacilities > 1 ? "have" : "has"
      } an R(t) < 1`}</p>
      <p className="mt-5 mb-5">
        Average R(t) reduction across facilities:{" "}
        {averageRtReductionAcrossFacilities}
      </p>
      <p className="mt-5 mb-5">Max R(t) change: {maxRtChange}</p>
    </div>
  );
};

export default RtSummaryStats;
