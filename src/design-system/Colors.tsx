import { lab } from "d3";
import hexAlpha from "hex-alpha";

import { RateOfSpreadType } from "../constants/EpidemicModel";

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

const BaseColors = {
  orange: "#e76f00",
  red: "#ff464a",
  darkRed: "#cb2500",
  lightBlue: "#33b6ff",
  teal: "#25b894",
  green: "#006c67",
  forest: "#005450",
  forestGray: "#467472",
  darkGreen: "#00413e",
  darkForest: "#033342",
  paleForest: "#667c7b",
  jade: "#447F7C",
  darkTeal: "#759f9e",
  paleTeal: "#58b596",
  darkGray: "#c8d3d3",
  paleGreen: "#d2dbdb",
  gray: "#e0e4e4",
  slate: "#e9ebeb",
  lightGray: "#e1e3e3",
  white: "#fff",
  black: "#000",
};

const Colors = {
  ...BaseColors,
  opacityForest: hexAlpha(BaseColors.forest, 0.7),
  opacityGray: hexAlpha(BaseColors.forestGray, 0.2),
  forest50: hexAlpha(BaseColors.forest, 0.5),
  forest30: hexAlpha(BaseColors.forest, 0.5),
  darkRed10: hexAlpha(BaseColors.darkRed, 0.1),
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

export const rtPillColors: {
  [key in RateOfSpreadType]: {
    text: string;
    border: string;
  };
} = {
  [RateOfSpreadType.Controlled]: {
    text: Colors.green,
    border: Colors.teal,
  },
  [RateOfSpreadType.Infectious]: {
    text: Colors.darkRed,
    border: Colors.orange,
  },
  [RateOfSpreadType.Missing]: {
    text: Colors.forest,
    border: Colors.forest30,
  },
};
