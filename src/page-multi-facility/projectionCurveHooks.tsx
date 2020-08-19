import { zip } from "d3-array";
import { useMemo } from "react";

import { EpidemicModelInputs } from "../impact-dashboard/EpidemicModelContext";
import {
  calculateCurves,
  CurveData,
  curveInputsFromUserInputs,
  curveInputsWithRt,
} from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { isRtData, isRtError } from "../infection-model/rt";
import {
  SeirCompartmentKeys,
  seirIndex,
  seirIndexList,
} from "../infection-model/seir";
import { RtValue } from "./types";

function getCurves(
  input: EpidemicModelInputs,
  useRt?: boolean,
  latestRt?: number,
  numDays?: number,
) {
  return calculateCurves(
    useRt
      ? curveInputsWithRt(input, latestRt)
      : curveInputsFromUserInputs(input),
    numDays,
  );
}

export const useProjectionData = (
  input: EpidemicModelInputs,
  useRt?: boolean,
  rtData?: RtValue,
  numDays?: number,
): CurveData | undefined => {
  let latestRt: number | undefined;

  if (useRt) {
    if (isRtError(rtData)) {
      useRt = false;
    } else if (isRtData(rtData)) {
      latestRt = rtData.Rt[rtData.Rt.length - 1].value;
    }
  }

  const curves = useMemo(() => getCurves(input, useRt, latestRt, numDays), [
    input,
    latestRt,
    useRt,
    numDays,
  ]);

  return curves;
};

function combinePopulations(data: CurveData, columnIndex: number) {
  return zip(
    getAllValues(getColView(data.incarcerated, columnIndex)),
    getAllValues(getColView(data.staff, columnIndex)),
  ).map(([incarcerated, staff]) => incarcerated + staff);
}

type CurveDataMapping = {
  [key in SeirCompartmentKeys]: number[];
};

function buildCurves(projectionData?: CurveData): CurveDataMapping | undefined {
  if (!projectionData) return undefined;

  const curvesToShow = seirIndexList;

  // each SEIR compartment will have a corresponding curve data array
  return curvesToShow.reduce((curves, currentIndex) => {
    return {
      ...curves,
      [seirIndex[currentIndex]]: combinePopulations(
        projectionData,
        currentIndex,
      ),
    };
  }, {} as CurveDataMapping);
}

export const useChartDataFromProjectionData = (projectionData?: CurveData) => {
  const curveData = useMemo(() => buildCurves(projectionData), [
    projectionData,
  ]);

  return curveData;
};
