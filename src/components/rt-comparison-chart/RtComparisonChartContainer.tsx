import { orderBy } from "lodash";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";

import { FacilityContext } from "../../contexts/facility-context/FacilityContext";
import Loading from "../../design-system/Loading";
import {
  getDaysAgoRt,
  getFacilitiesRtDataById,
} from "../../infection-model/rt";
import { Facilities, RtDataMapping } from "../../page-multi-facility/types";
import RtComparisonChart, {
  isRtComparisonData,
  RtComparisonData,
} from "./RtComparisonChart";

const Container = styled.div`
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
`;

const RtComparisonChartContainer: React.FC<{
  facilities: Facilities;
  rtDaysOffset: number;
}> = ({ facilities, rtDaysOffset }) => {
  const { rtData: rtDataMapping } = useContext(FacilityContext);
  const [chartData, setChartData] = useState([] as RtComparisonData[]);
  const [loading, updateLoading] = useState(true);

  const generateChartData = (
    facilities: Facilities,
    rtDataMapping: RtDataMapping | undefined,
    rtDaysOffset: number,
  ) => {
    const facilitiesRtData =
      getFacilitiesRtDataById(rtDataMapping, facilities) || {};
    return Object.entries(facilitiesRtData)
      .map(([facilityId, rtData]) => {
        const facility = facilities.find(
          (facility) => facility.id === facilityId,
        );
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
          id: facilityId,
          values,
        };
      })
      .filter(isRtComparisonData);
  };

  useEffect(() => {
    const chartData = generateChartData(
      facilities,
      rtDataMapping,
      rtDaysOffset,
    );
    setChartData(orderBy(chartData, ["values.Rt"]));
  }, [facilities, rtDataMapping, rtDaysOffset]);

  useEffect(() => {
    updateLoading(
      // we don't track overall Rt data loading status anywhere;
      // so far this is the only place that cares about it
      facilities.some(
        (facility) => !rtDataMapping?.hasOwnProperty(facility.id),
      ),
    );
  }, [facilities, rtDataMapping]);

  return (
    <Container>
      {loading && (
        <LoadingOverlay>
          <Loading />
        </LoadingOverlay>
      )}
      <RtComparisonChart data={chartData} />
    </Container>
  );
};

export default RtComparisonChartContainer;
