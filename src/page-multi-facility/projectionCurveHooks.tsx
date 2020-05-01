import { zip } from "d3-array";
import { useEffect, useState } from "react";

import { ChartData } from "../impact-dashboard/CurveChart";
import { EpidemicModelInputs } from "../impact-dashboard/EpidemicModelContext";
import {
  calculateCurves,
  CurveData,
  curveInputsFromUserInputs,
} from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";

export const useProjectionFromUserInput = (
  input: EpidemicModelInputs,
): CurveData => {
  const [curves, updateCurves] = useState(
    calculateCurves(curveInputsFromUserInputs(input)),
  );

  useEffect(() => {
    updateCurves(calculateCurves(curveInputsFromUserInputs(input)));
  }, [input]);

  return curves;
};

function combinePopulations(data: CurveData, columnIndex: number) {
  return zip(
    getAllValues(getColView(data.incarcerated, columnIndex)),
    getAllValues(getColView(data.staff, columnIndex)),
  ).map(([incarcerated, staff]) => incarcerated + staff);
}

function buildCurves(projectionData: CurveData) {
  // merge and filter the curve data to only what we need for the chart
  return {
    exposed: combinePopulations(projectionData, seirIndex.exposed),
    fatalities: combinePopulations(projectionData, seirIndex.fatalities),
    hospitalized: combinePopulations(projectionData, seirIndex.hospitalized),
    infectious: combinePopulations(projectionData, seirIndex.infectious),
  };
}

export const useChartDataFromProjectionData = (projectionData: CurveData) => {
  const [curveData, updateCurveData] = useState(buildCurves(projectionData));

  useEffect(() => {
    updateCurveData(buildCurves(projectionData));
  }, [projectionData]);

  return curveData;
};

export const useChartDataFromUserInput = (
  input: EpidemicModelInputs,
): ChartData => {
  const projectionData = useProjectionFromUserInput(input);
  const curveData = useChartDataFromProjectionData(projectionData);

  return curveData;
};
