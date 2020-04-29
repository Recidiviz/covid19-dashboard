import { range, sum } from "d3-array";
import flatten from "lodash/flatten";
import React from "react";

import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import {
  calculateAllCurves,
  curveInputsFromUserInputs,
} from "../infection-model";
import { ageGroupIndex, seirIndex } from "../infection-model/seir";
import ModelInspectionTable from "./ModelInspectionTable";

const ModelInspectionTableContainer: React.FC = () => {
  const modelData = useEpidemicModelState();
  const {
    expectedPopulationChanges,
    projectionGrid,
    totalPopulationByDay,
  } = calculateAllCurves(curveInputsFromUserInputs(modelData));

  const dataRows = flatten(
    range(projectionGrid.shape[0]).map((compartment) =>
      range(projectionGrid.shape[2]).map((bracket) => [
        // label cell
        `${seirIndex[compartment]} ${ageGroupIndex[bracket]}`,
        // data cells
        ...range(projectionGrid.shape[1]).map((day) =>
          projectionGrid.get(compartment, day, bracket),
        ),
      ]),
    ),
  );

  const days = projectionGrid.shape[1];

  const tableData = [
    // header row
    [
      // label cell
      "Days from today",
      // header cells
      ...range(days),
    ],
    // summary rows
    [
      // label cell
      "Total population",
      // data cells
      ...totalPopulationByDay,
    ],
    [
      // label cell
      "Expected population changes",
      ...expectedPopulationChanges,
    ],
    [
      // label cell
      "Checksum (should be 0)",
      ...range(days).map((day) => {
        return (
          totalPopulationByDay[day] -
          // rounding to shave off any weird artifacts from floating-point arithmetic,
          // which could make us wind up with NaNs here for some reason
          Math.round(
            sum(
              // off by one because of label row
              // TS didn't like this but these should always be numbers
              dataRows.map((row) => (row[day + 1] as unknown) as number),
            ),
          )
        );
      }),
    ],
    ...dataRows,
  ];
  return (
    <ModelInspectionTable
      data={tableData}
      summaryRows={
        tableData.length - 1 - projectionGrid.shape[0] * projectionGrid.shape[2]
      }
    />
  );
};

export default ModelInspectionTableContainer;
