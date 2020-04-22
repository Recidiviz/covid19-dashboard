import "@testing-library/jest-dom";
import "jest-styled-components";

import { render } from "@testing-library/react";

import InputToggle from "../InputToggle";

describe("<InputToggle />", () => {
  test("renders the InputToggle", () => {
    expect(() =>
      render(<InputToggle toggled onChange={jest.fn()} />),
    ).not.toThrow();
  });
});
