import React from "react";

import RtComparisonChart from "./RtComparisonChart";

const RtComparisonChartContainer: React.FC = () => {
  // TODO: not this
  const fakeData = [
    // {
    //   name: "facility 1",
    //   id: "abc123",
    //   values: { Rt: 1.9, low90: 0.4, high90: 3.8 },
    // },
    // {
    //   name: "facility 2 what has a long name ",
    //   id: "def456",
    //   values: {
    //     Rt: 0.6,
    //     low90: 0,
    //     high90: 1.5,
    //   },
    // },
    // { name: "facility with no data and a long name", id: "xyz789", values: {} },
  ] as any;

  return <RtComparisonChart data={fakeData} />;
};

export default RtComparisonChartContainer;
