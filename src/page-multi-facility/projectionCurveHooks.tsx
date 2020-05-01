import { zip } from "d3-array";
import { useEffect, useState } from "react";

import { EpidemicModelInputs } from "../impact-dashboard/EpidemicModelContext";
import {
  calculateCurves,
  CurveData,
  curveInputsFromUserInputs,
  curveInputsWithRt,
} from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { RtData } from "../infection-model/rt";
import { seirIndex } from "../infection-model/seir";

function getCurves(
  input: EpidemicModelInputs,
  useRt?: boolean,
  latestRt?: number,
) {
  return calculateCurves(
    useRt
      ? curveInputsWithRt(input, latestRt)
      : curveInputsFromUserInputs(input),
  );
}

export const useProjectionData = (
  input: EpidemicModelInputs,
  useRt?: boolean,
  rtData?: RtData | null,
): CurveData | undefined => {
  let latestRt: number | undefined;

  if (useRt) {
    // a null value indicates Rt fetching failed
    if (rtData === null) {
      useRt = false;
    } else {
      latestRt = rtData?.Rt[rtData.Rt.length - 1].value;
    }
  }

  const [curves, updateCurves] = useState(getCurves(input, useRt, latestRt));

  useEffect(() => {
    updateCurves(getCurves(input, useRt, latestRt));
  }, [input, latestRt, useRt]);

  return curves;
};

function combinePopulations(data: CurveData, columnIndex: number) {
  return zip(
    getAllValues(getColView(data.incarcerated, columnIndex)),
    getAllValues(getColView(data.staff, columnIndex)),
  ).map(([incarcerated, staff]) => incarcerated + staff);
}

function buildCurves(projectionData?: CurveData) {
  if (!projectionData) return undefined;

  // merge and filter the curve data to only what we need for the chart
  return {
    exposed: combinePopulations(projectionData, seirIndex.exposed),
    fatalities: combinePopulations(projectionData, seirIndex.fatalities),
    hospitalized: combinePopulations(projectionData, seirIndex.hospitalized),
    infectious: combinePopulations(projectionData, seirIndex.infectious),
  };
}

export const useChartDataFromProjectionData = (projectionData?: CurveData) => {
  const [curveData, updateCurveData] = useState(buildCurves(projectionData));

  useEffect(() => {
    updateCurveData(buildCurves(projectionData));
  }, [projectionData]);

  return curveData;
};
