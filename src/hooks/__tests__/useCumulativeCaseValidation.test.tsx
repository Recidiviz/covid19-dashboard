import { act, renderHook } from "@testing-library/react-hooks";

import useCumulativeCaseValidation from "../useCumulativeCaseValidation";

describe("useCumulativeCaseValidation hook", () => {
  it("should validate that new cases are not less than previous", () => {
    const previousInputs = { ageUnknownCases: 50 };
    const { result } = renderHook(() =>
      useCumulativeCaseValidation({ previous: previousInputs }),
    );

    // cases only add up to 45
    const invalidInput = {
      ageUnknownCases: 25,
      age45Cases: 20,
    };
    expect(result.current.validateCases(invalidInput)).toBe(false);

    // 55 cases
    const validInput = {
      ...invalidInput,
      age65Cases: 10,
    };
    expect(result.current.validateCases(validInput)).toBe(true);

    // can be equal to previous
    validInput.age65Cases = 5;
    expect(result.current.validateCases(validInput)).toBe(true);
  });

  it("should validate that new cases are not more than next", () => {
    const nextInputs = { ageUnknownCases: 50 };
    const { result } = renderHook(() =>
      useCumulativeCaseValidation({ next: nextInputs }),
    );

    // cases only add up to 45
    const validInput = {
      age20Cases: 25,
      age55Cases: 20,
    };
    expect(result.current.validateCases(validInput)).toBe(true);

    // can be equal to next
    validInput.age55Cases = 25;
    expect(result.current.validateCases(validInput)).toBe(true);

    // 55 cases
    const invalidInput = {
      ...validInput,
      age75Cases: 10,
    };
    expect(result.current.validateCases(invalidInput)).toBe(false);
  });

  it("should validate that new cases are between previous and next", () => {
    const previousInputs = { ageUnknownCases: 40 };
    const nextInputs = { ageUnknownCases: 50 };
    const { result } = renderHook(() =>
      useCumulativeCaseValidation({
        previous: previousInputs,
        next: nextInputs,
      }),
    );

    const invalidInput = {
      ageUnknownCases: 30,
      ageUnknownPopulation: 500,
    };
    expect(result.current.validateCases(invalidInput)).toBe(false);

    invalidInput.ageUnknownCases = 60;
    expect(result.current.validateCases(invalidInput)).toBe(false);

    const validInput = { ageUnknownCases: 45 };
    expect(result.current.validateCases(validInput)).toBe(true);

    // can be equal to either boundary
    validInput.ageUnknownCases = 40;
    expect(result.current.validateCases(validInput)).toBe(true);
    validInput.ageUnknownCases = 50;
    expect(result.current.validateCases(validInput)).toBe(true);
  });
});
