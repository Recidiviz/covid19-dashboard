import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { RtData } from "../infection-model/rt";
import RtTimeseries from "./RtTimeseries";

interface Props {
  data?: RtData;
}

const RtTimeseriesContainer: React.FC<Props> = ({ data }) => {
  const notEnoughData = data && data.Rt.length < 2;
  return data ? (
    notEnoughData ? null : (
      <RtTimeseries data={data} />
    )
  ) : (
    <Loading />
  );
};

export default RtTimeseriesContainer;
