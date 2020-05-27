import { range } from "d3-array";

import {
  EpidemicModelInputs,
  RateOfSpread,
} from "../../impact-dashboard/EpidemicModelContext";
import {
  calculateAllCurves,
  CurveFunctionInputs,
  curveInputsFromUserInputs,
  curveInputsWithRt,
} from "../index";
import { ageGroupIndex, seirIndex } from "../seir";

describe("curveInputsFromUserInputs function", () => {
  let inputs = {} as EpidemicModelInputs;
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
      facilityCapacity: 10000,
      populationTurnover: 0,
      staffCases: 7,
      staffPopulation: 23,
      rateOfSpreadFactor: RateOfSpread.high,
      usePopulationSubsets: true,
    };
  });

  test("the facilityOccupancyPct is calculated based on facilityCapacity", () => {
    const { facilityOccupancyPct } = curveInputsFromUserInputs(inputs);

    expect(facilityOccupancyPct).not.toBe(inputs.facilityOccupancyPct);
    expect(facilityOccupancyPct).toBe(0.7304);
  });

  test("the facilityOccupancyPct defaults to 1 if undefined facilityCapacity", () => {
    delete inputs.facilityCapacity;
    const { facilityOccupancyPct } = curveInputsFromUserInputs(inputs);

    expect(facilityOccupancyPct).not.toBe(inputs.facilityOccupancyPct);
    expect(facilityOccupancyPct).toBe(1);
  });
});

describe("curveInputsWithRt function", () => {
  let inputs = {} as EpidemicModelInputs;
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
      facilityCapacity: 8000,
      populationTurnover: 0,
      staffCases: 7,
      staffPopulation: 23,
      rateOfSpreadFactor: RateOfSpread.high,
      usePopulationSubsets: true,
    };
  });

  test("the facilityOccupancyPct is calculated based on facilityCapacity", () => {
    const result = curveInputsWithRt(inputs, 1);
    let facilityOccupancyPct;
    if (result) {
      facilityOccupancyPct = result.facilityOccupancyPct;
    }

    expect(facilityOccupancyPct).not.toBe(inputs.facilityOccupancyPct);
    expect(facilityOccupancyPct).toBe(0.913);
  });

  test("the facilityOccupancyPct defaults to 1 if undefined facilityCapacity", () => {
    delete inputs.facilityCapacity;
    const result = curveInputsWithRt(inputs, 1);
    let facilityOccupancyPct;
    if (result) {
      facilityOccupancyPct = result.facilityOccupancyPct;
    }

    expect(facilityOccupancyPct).not.toBe(inputs.facilityOccupancyPct);
    expect(facilityOccupancyPct).toBe(1);
  });
});

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
      rateOfSpreadCells: 1.8,
      rateOfSpreadDorms: 2.4,
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
});
