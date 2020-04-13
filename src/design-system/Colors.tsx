import { lab } from "d3";

export function darken(color: string, amount: number) {
  // good to use Lab color because it's perceptually uniform
  const { l, a, b } = lab(color);
  return lab(l - amount, a, b).hex();
}

const Colors = {
  black: "#000",
  green: "#006C67",
  forest: "#005450",
  lightBlue: "#33B6FF",
  red: "#FF464A",
  grey: "#D2DBDB",
};

export default Colors;
