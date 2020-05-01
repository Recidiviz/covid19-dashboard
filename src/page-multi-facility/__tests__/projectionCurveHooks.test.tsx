import { render } from "@testing-library/react";
import React from "react";

import { RateOfSpread } from "../../impact-dashboard/EpidemicModelContext";
import {
  useChartDataFromUserInput,
  useProjectionFromUserInput,
} from "../projectionCurveHooks";

describe("useProjectionFromUserInput", () => {
  let input: any;
  let returnVal: any;

  function TestComponent({ input }: { input: any }) {
    returnVal = useProjectionFromUserInput(input);
    return null;
  }

  beforeEach(() => {
    input = {
      ageUnknownCases: 1500,
      ageUnknownPopulation: 6543,
      facilityDormitoryPct: 0.3,
      facilityOccupancyPct: 1.15,
      populationTurnover: 0,
      rateOfSpreadFactor: RateOfSpread.high,
      staffCases: 7,
      staffPopulation: 23,
      usePopulationSubsets: true,
    };
  });

  test("reference remains stable with same input", () => {
    const { rerender } = render(<TestComponent input={input} />);
    const firstReturnVal = returnVal;

    rerender(<TestComponent input={input} />);
    expect(firstReturnVal).toBe(returnVal);
  });

  test("reference changes with new input", () => {
    const { rerender } = render(<TestComponent input={input} />);
    const firstReturnVal = returnVal;

    rerender(<TestComponent input={{ ...input }} />);
    expect(firstReturnVal).not.toBe(returnVal);
  });
});

describe("useChartDataFromUserInput", () => {
  let input: any;
  let returnVal: any;

  function TestComponent({ input }: { input: any }) {
    returnVal = useChartDataFromUserInput(input);
    return null;
  }

  beforeEach(() => {
    input = {
      ageUnknownCases: 1500,
      ageUnknownPopulation: 6543,
      facilityDormitoryPct: 0.3,
      facilityOccupancyPct: 1.15,
      populationTurnover: 0,
      rateOfSpreadFactor: RateOfSpread.high,
      staffCases: 7,
      staffPopulation: 23,
      usePopulationSubsets: true,
    };
  });

  test("reference remains stable with same input", () => {
    const { rerender } = render(<TestComponent input={input} />);
    const firstReturnVal = returnVal;

    rerender(<TestComponent input={input} />);
    expect(firstReturnVal).toBe(returnVal);
  });

  test("reference changes with new input", () => {
    const { rerender } = render(<TestComponent input={input} />);
    const firstReturnVal = returnVal;

    rerender(<TestComponent input={{ ...input }} />);
    expect(firstReturnVal).not.toBe(returnVal);
  });
});
