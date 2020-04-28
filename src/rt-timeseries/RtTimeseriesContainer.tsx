import React from "react";

import Loading from "../design-system/Loading";
import { RtData } from "../infection-model/rt";
import RtTimeseries from "./RtTimeseries";

interface Props {
  data?: RtData;
}

const RtTimeseriesContainer: React.FC<Props> = ({ data }) => {
  return data ? <RtTimeseries data={data} /> : <Loading />;
};

export default RtTimeseriesContainer;
