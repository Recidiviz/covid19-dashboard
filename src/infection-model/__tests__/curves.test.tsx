import { range } from "d3-array";

import { RateOfSpread } from "../../impact-dashboard/EpidemicModelContext";
import {
  calculateAllCurves,
  CurveFunctionInputs,
  getR0FromSize,
} from "../index";
import { ageGroupIndex, seirIndex } from "../seir";

describe("calculateAllCurves function", () => {
  let inputs = {} as CurveFunctionInputs;
  beforeEach(() => {
    inputs = {
      age0Cases: 10,
      age0Population: 123,
      age20Cases: 20,
      age20Population: 456,
      age45Cases: 25,
      age45Population: 789,
      age55Cases: 14,
      age55Population: 1012,
      age65Cases: 40,
      age65Population: 1345,
      age75Cases: 100,
      age75Population: 1678,
      age85Cases: 25,
      age85Population: 1901,
      ageUnknownCases: 0,
      ageUnknownPopulation: 0,
      facilityDormitoryPct: 0.3,
      facilityOccupancyPct: 1.15,
      populationTurnover: 0,
      rateOfSpreadFactor: RateOfSpread.low,
      staffCases: 7,
      staffPopulation: 23,
      usePopulationSubsets: true,
    };
  });

  test("we should have 90 days of data", () => {
    const {
      totalPopulationByDay,
      projectionGrid,
      expectedPopulationChanges,
    } = calculateAllCurves(inputs);

    expect(totalPopulationByDay.length).toBe(90);
    expect(expectedPopulationChanges.length).toBe(90);
    expect(projectionGrid.shape[1]).toBe(90);
  });

  test("3D projection array should have the right shape", () => {
    const { projectionGrid } = calculateAllCurves(inputs);
    expect(projectionGrid.shape).toEqual([
      seirIndex.__length,
      90,
      ageGroupIndex.__length,
    ]);
  });

  test("each day's compartments should equal total population", () => {
    const { totalPopulationByDay, projectionGrid } = calculateAllCurves(inputs);
    totalPopulationByDay.forEach((totalPop, day) => {
      let sumOfCompartments = 0;

      range(projectionGrid.shape[0]).map((compartment) =>
        range(projectionGrid.shape[2]).map(
          (bracket) =>
            (sumOfCompartments += projectionGrid.get(
              compartment,
              day,
              bracket,
            )),
        ),
      );
      expect(totalPop).not.toBe(0);
      expect(totalPop).toBeCloseTo(sumOfCompartments, 5);
    });
  });

  test("should accept explicit rate of spread numbers", () => {
    const rateOfSpreadCells = 1.8;
    const rateOfSpreadDorms = 2.4;
    const rateOfSpreadDefaults = getR0FromSize(inputs.rateOfSpreadFactor);
    // sanity check that these values are actually different from the defaults
    expect({ rateOfSpreadCells, rateOfSpreadDorms }).not.toEqual(
      rateOfSpreadDefaults,
    );

    const { projectionGrid: projectionGridDefault } = calculateAllCurves(
      inputs,
    );
    const { projectionGrid: projectionGridExplicit } = calculateAllCurves({
      ...inputs,
      rateOfSpreadCells,
      rateOfSpreadDorms,
    });

    // helper to get daily totals for a single compartment
    function getCurveValues(
      grid: typeof projectionGridDefault,
      compartment: number,
    ) {
      return range(grid.shape[1]).map((day) =>
        range(grid.shape[2]).reduce(
          (sumOfCompartments, bracket) =>
            (sumOfCompartments += grid.get(compartment, day, bracket)),
          0,
        ),
      );
    }

    // we can't predict the exact effect but the curves should be different
    range(projectionGridDefault.shape[0]).map((compartment) => {
      const defaultCurve: number[] = getCurveValues(
        projectionGridDefault,
        compartment,
      );
      const explicitCurve: number[] = getCurveValues(
        projectionGridExplicit,
        compartment,
      );

      expect(defaultCurve.length).toEqual(explicitCurve.length);
      expect(defaultCurve).not.toEqual(explicitCurve);
    });
  });
});
