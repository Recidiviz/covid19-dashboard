import { render } from "@testing-library/react";
import React from "react";

import { EpidemicModelInputs } from "../../impact-dashboard/EpidemicModelContext";
import { RtData } from "../../infection-model/rt";
import { useProjectionData } from "../projectionCurveHooks";

describe("useProjectionData", () => {
  let input: any;
  let returnVal: any;
  let rtData: any;
  let useRt: boolean;

  function TestComponent({
    input,
    rtData,
    useRt,
  }: {
    input: EpidemicModelInputs;
    rtData?: RtData;
    useRt?: boolean;
  }) {
    returnVal = useProjectionData(input, useRt, rtData);
    return null;
  }

  beforeEach(() => {
    returnVal = undefined;
    useRt = true;
    input = {
      ageUnknownCases: 1500,
      ageUnknownPopulation: 6543,
      facilityDormitoryPct: 0.3,
      facilityOccupancyPct: 1.15,
      populationTurnover: 0,
      staffCases: 7,
      staffPopulation: 23,
      usePopulationSubsets: true,
    };
    rtData = {
      Rt: [{ date: new Date(), value: 2.2 }],
      low90: [{ date: new Date(), value: 1.2 }],
      high90: [{ date: new Date(), value: 3.2 }],
    };
  });

  test("reference remains stable with same input", () => {
    const { rerender } = render(
      <TestComponent useRt={useRt} input={input} rtData={rtData} />,
    );
    const firstReturnVal = returnVal;

    rerender(<TestComponent useRt={useRt} input={input} rtData={rtData} />);
    expect(firstReturnVal).toBe(returnVal);

    rerender(
      <TestComponent useRt={useRt} input={input} rtData={{ ...rtData }} />,
    );
    // this should still be the same because the last value of Rt hasn't changed
    expect(firstReturnVal).toBe(returnVal);
  });

  test("reference changes with new input", () => {
    const { rerender } = render(
      <TestComponent useRt={useRt} input={input} rtData={rtData} />,
    );
    let prevReturnVal = returnVal;

    rerender(
      <TestComponent
        useRt={useRt}
        input={input}
        rtData={{ ...rtData, Rt: [{ date: new Date(), value: 2.1 }] }}
      />,
    );
    expect(prevReturnVal).not.toBe(returnVal);

    prevReturnVal = returnVal;

    rerender(
      <TestComponent
        useRt={useRt}
        input={{ ...input }}
        rtData={{ ...rtData }}
      />,
    );
    expect(prevReturnVal).not.toBe(returnVal);
  });

  test("Rt is optional", () => {
    useRt = false;

    render(<TestComponent useRt={useRt} input={input} rtData={rtData} />);
    expect(returnVal).toBeDefined();

    returnVal = undefined;

    render(<TestComponent input={input} />);
    expect(returnVal).toBeDefined();
  });
});
