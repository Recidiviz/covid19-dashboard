import React, { useContext } from "react";

import { MarkColors as markColors } from "../design-system/Colors";
import CurveChartContainer from "../impact-dashboard/CurveChartContainer";
import {
  totalConfirmedCases,
  useEpidemicModelState,
} from "../impact-dashboard/EpidemicModelContext";
import { FacilityContext } from "./FacilityContext";

const groupStatus = {
  exposed: true,
  fatalities: true,
  hospitalized: true,
  infectious: true,
};

const FacilityRow: React.FC = () => {
  const facility = useContext(FacilityContext);
  const confirmedCases = totalConfirmedCases(useEpidemicModelState());
  if (!facility) {
    throw new Error("Facility must be provided to the FacilityContext");
  }

  const { name } = facility;

  return (
    <div>
      <div className="flex flex-row h-48 mb-8 border-b border-grey-300">
        <div className="w-2/5 flex flex-col justify-between">
          <div className="flex flex-row">
            <div className="w-1/4 text-red-600 font-bold">{confirmedCases}</div>
            <div className="w-3/4 font-bold">{name}</div>
          </div>
          <div className="text-xs text-gray-500 pb-4 flex flex-row justify-between">
            <div>Last update: on March 25, 2020</div>
            <div className="mr-8">
              <a className="px-1" href="#">
                Delete
              </a>
              <a className="px-1" href="#">
                Edit
              </a>
              <a className="px-1" href="#">
                Share
              </a>
            </div>
          </div>
        </div>
        <div className="w-3/5">
          <CurveChartContainer
            chartHeight={200}
            groupStatus={groupStatus}
            markColors={markColors}
          />
        </div>
      </div>
    </div>
  );
};

export default FacilityRow;
