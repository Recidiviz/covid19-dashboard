import { lab } from "d3";
import { opacify } from "polished";

export function darken(color: string, amount: number) {
  // good to use Lab color because it's perceptually uniform
  const { l, a, b } = lab(color);
  return lab(l - amount, a, b).hex();
}

export function lighten(color: string, amount: number) {
  // good to use Lab color because it's perceptually uniform
  const { l, a, b } = lab(color);
  return lab(l + amount, a, b).hex();
}

const Colors = {
  white: "#ffffff",
  lightGray: "#E1E3E3",
  gray: "#E0E4E4",
  opacityGray: `${opacify(0.2, "#467472")}`,
  slate: "#e9ebeb",
  red: "#FF464A",
  orange: "#E76F00",
  darkRed: "#CB2500",
  green: "#006C67",
  paleGreen: "#D2DBDB",
  darkForest: "#033342",
  paleForest: "#667c7b",
  forest: "#005450",
  opacityForest: `${opacify(0.7, "#005450")}`,
  darkGreen: "#00413E",
  teal: "#25b894",
  darkTeal: "#759f9e",
  lightBlue: "#33B6FF",
  darkGray: "#c8d3d3",
  black: "#000",
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
