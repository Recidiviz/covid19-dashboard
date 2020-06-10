import { SeirCompartmentKeys, seirIndex } from "../infection-model/seir";

// this is the subset of projection curves we include in charts for general audiences
const publicCurves = [
  seirIndex.exposed,
  seirIndex.infectious,
  seirIndex.hospitalized,
  seirIndex.fatalities,
];

export type CurveToggles = {
  [key in SeirCompartmentKeys | "cases"]?: boolean;
};

export function buildInitialCurveToggles(
  curveIndices: seirIndex[],
): CurveToggles {
  return curveIndices.reduce((groups, currentCurveIndex) => {
    return { ...groups, [seirIndex[currentCurveIndex]]: true };
  }, {});
}

function buildPublicCurvesAndCaseToggles(
  curveIndices: seirIndex[],
): CurveToggles {
  const curveToggles = buildInitialCurveToggles(curveIndices);
  return { cases: true, ...curveToggles };
}

export const initialPublicCurveToggles = buildInitialCurveToggles(publicCurves);
export const publicCurvesAndCaseToggles = buildPublicCurvesAndCaseToggles(
  publicCurves,
);
