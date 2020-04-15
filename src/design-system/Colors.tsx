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
  green: "#006C67",
  lightBlue: "#33B6FF",
  paleGreen: "#D2DBDB",
  red: "#FF464A",
  sageGreen: "#759F9E",
};

export default Colors;
