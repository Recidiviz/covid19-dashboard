import { lab } from "d3";

export function darken(color: string, amount: number) {
  // good to use Lab color because it's perceptually uniform
  const { l, a, b } = lab(color);
  return lab(l - amount, a, b).hex();
}

const Colors = {
  black: "#000",
  slate: "#e9ebeb",
  forest: "#005450",
  teal: "#25b894",
  darkTeal: "#759f9e",
  gray: "#E0E4E4",
  darkGray: "#c8d3d3",
  green: "#006C67",
  lightBlue: "#33B6FF",
  paleGreen: "#D2DBDB",
  red: "#FF464A",
  white: "#ffffff",
  darkGreen: "#00413E",
};

// Shared colors for the Projection charts
export const MarkColors = {
  exposed: Colors.green,
  fatalities: Colors.black,
  hospitalized: Colors.lightBlue,
  hospitalBeds: darken(Colors.lightBlue, 20),
  infectious: Colors.red,
};

export default Colors;
