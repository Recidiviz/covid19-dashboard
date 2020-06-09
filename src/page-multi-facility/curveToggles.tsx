import { SeirCompartmentKeys, seirIndex } from "../infection-model/seir";

// this is the subset of projection curves we include in charts for general audiences
const publicCurves = [
  seirIndex.exposed,
  seirIndex.infectious,
  seirIndex.hospitalized,
  seirIndex.fatalities,
];

export type CurveToggles = {
  [key in SeirCompartmentKeys]?: boolean;
};

export function buildInitialCurveToggles(
  curveIndices: seirIndex[],
): CurveToggles {
  return curveIndices.reduce((groups, currentCurveIndex) => {
    return { ...groups, [seirIndex[currentCurveIndex]]: true };
  }, {});
}

export const initialPublicCurveToggles = buildInitialCurveToggles(publicCurves);
