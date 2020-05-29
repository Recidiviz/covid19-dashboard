import { validateCumulativeCases } from "../validators";

describe("useCumulativeCaseValidation hook", () => {
  it("should validate that new cases are not less than previous", () => {
    const compareTo = { previous: { ageUnknownCases: 50 } };

    // cases only add up to 45
    const invalidInput = {
      ageUnknownCases: 25,
      age45Cases: 20,
    };
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);

    // 55 cases
    const validInput = {
      ...invalidInput,
      age65Cases: 10,
    };
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);

    // can be equal to previous
    validInput.age65Cases = 5;
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);
  });

  it("should validate that new cases are not more than next", () => {
    const compareTo = { next: { ageUnknownCases: 50 } };

    // cases only add up to 45
    const validInput = {
      age20Cases: 25,
      age55Cases: 20,
    };
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);

    // can be equal to next
    validInput.age55Cases = 25;
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);

    // 55 cases
    const invalidInput = {
      ...validInput,
      age75Cases: 10,
    };
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);
  });

  it("should validate that new cases are between previous and next", () => {
    const compareTo = {
      previous: { ageUnknownCases: 40 },
      next: { ageUnknownCases: 50 },
    };
    const invalidInput = {
      ageUnknownCases: 30,
      ageUnknownPopulation: 500,
    };
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);

    invalidInput.ageUnknownCases = 60;
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);

    const validInput = { ageUnknownCases: 45 };
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);

    // can be equal to either boundary
    validInput.ageUnknownCases = 40;
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);
    validInput.ageUnknownCases = 50;
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);
  });
});
