import React from "react";

import { RtData, RtRecord } from "../infection-model/rt";
import { RtDataMapping } from "../page-multi-facility/FacilityContext";
import * as rtStats from "./rtStatistics";

interface Props {
  rtData: RtDataMapping;
}

function filterRtData(data: RtData | null): data is RtData {
  return data !== null;
}

const RtSummaryStats: React.FC<Props> = ({ rtData }) => {
  const rtDataValues: (RtData | null)[] = Object.values(rtData);

  const facilitiesRtRecords: RtRecord[][] = rtDataValues
    .filter(filterRtData)
    .map((rtData: RtData) => rtData.Rt);

  const numFacilities = facilitiesRtRecords.length;
  const numFacilitiesWithRtLessThan1 = rtStats.numFacilitiesWithRtLessThan1(
    facilitiesRtRecords,
  );
  const averageRtReductionAcrossFacilities = rtStats.averageRtReductionAcrossFacilities(
    facilitiesRtRecords,
  );
  return (
    <div>
      <p className="mt-5 mb-5">{`${numFacilitiesWithRtLessThan1} of ${numFacilities} facilities currently ${
        numFacilities > 1 ? "have" : "has"
      } an R(t) < 1`}</p>
      <p className="mt-5 mb-5">
        Average R(t) reduction across facilities:{" "}
        {averageRtReductionAcrossFacilities}
      </p>
    </div>
  );
};

export default RtSummaryStats;
