import { ModelInputsPopulationBrackets } from "../../impact-dashboard/EpidemicModelContext";
import { validateCumulativeCases } from "../validators";

describe("useCumulativeCaseValidation hook", () => {
  it("should validate that new cases are not less than previous", () => {
    const compareTo = { previous: { ageUnknownCases: 50, age45Cases: 20 } };

    // the total is higher but a bracket is missing
    const invalidInput: ModelInputsPopulationBrackets = {
      age45Cases: 100,
    };
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);

    // the total is higher but a bracket has decreased
    invalidInput.ageUnknownCases = 25;
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);

    // can be equal to previous, or higher
    let validInput = {
      age45Cases: 25,
      ageUnknownCases: 50,
    };
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);

    validInput = { ageUnknownCases: 55, age45Cases: 20 };
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);
  });

  it("should validate that new cases are not more than next", () => {
    const compareTo = { next: { ageUnknownCases: 50, age45Cases: 20 } };

    // the total is lower but a bracket is missing
    const invalidInput: ModelInputsPopulationBrackets = {
      age45Cases: 10,
    };
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);

    // the total is lower but a bracket has increased
    invalidInput.ageUnknownCases = 55;
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);

    // can be equal to next, or lower
    let validInput = {
      age45Cases: 10,
      ageUnknownCases: 50,
    };
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);

    validInput = {
      age45Cases: 20,
      ageUnknownCases: 30,
    };
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);
  });

  it("should validate that new cases are between previous and next", () => {
    const compareTo = {
      previous: { ageUnknownCases: 40 },
      next: { ageUnknownCases: 50 },
    };
    let invalidInput: ModelInputsPopulationBrackets = {
      ageUnknownCases: 30,
    };
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);

    invalidInput.ageUnknownCases = 60;
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);

    // validation is per bracket so a missing one should also be invalid
    invalidInput = { age20Cases: 45 };
    expect(validateCumulativeCases(invalidInput, compareTo)).toBe(false);

    const validInput = { ageUnknownCases: 45 };
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);

    // can be equal to either boundary
    validInput.ageUnknownCases = 40;
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);
    validInput.ageUnknownCases = 50;
    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);
  });

  it("should not be affected by the presence of irrelevant keys", () => {
    const compareTo = {
      previous: { ageUnknownCases: 40, ageUnknownPopulation: 1000 },
      next: { ageUnknownCases: 50, ageUnknownPopulation: 950 },
    };
    const validInput: ModelInputsPopulationBrackets = {
      ageUnknownCases: 45,
      // this property violates monotonic increasing (as do previous and next) and we should not care
      ageUnknownPopulation: 975,
    };

    expect(validateCumulativeCases(validInput, compareTo)).toBe(true);
  });
});
