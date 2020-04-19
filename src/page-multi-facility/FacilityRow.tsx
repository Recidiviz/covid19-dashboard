import React, { useContext } from "react";
import { useHistory } from "react-router-dom";

import { MarkColors as markColors } from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import CurveChartContainer from "../impact-dashboard/CurveChartContainer";
import {
  totalConfirmedCases,
  useEpidemicModelState,
} from "../impact-dashboard/EpidemicModelContext";
import { FacilityContext } from "./FacilityContext";
import { Facility } from "./types";

const groupStatus = {
  exposed: true,
  fatalities: true,
  hospitalized: true,
  infectious: true,
};

interface Props {
  facility: Facility;
}

const FacilityRow: React.FC<Props> = ({ facility }) => {
  const confirmedCases = totalConfirmedCases(useEpidemicModelState());
  const history = useHistory();
  const { setFacility } = useContext(FacilityContext);

  const { id, name, updatedAt } = facility;

  const openFacilityPage = (event: React.MouseEvent<HTMLElement>) => {
    setFacility(facility);
    history.push("/multi-facility/facility");
  };

  return (
    <div onClick={openFacilityPage} className="cursor-pointer">
      <div className="flex flex-row h-48 mb-8 border-b border-grey-300">
        <div className="w-2/5 flex flex-col justify-between">
          <div className="flex flex-row">
            <div className="w-1/4 text-red-600 font-bold">{confirmedCases}</div>
            <div className="w-3/4 font-bold">{name}</div>
          </div>
          <div className="text-xs text-gray-500 pb-4 flex flex-row justify-between">
            <div>
              Last update: <DateMMMMdyyyy date={new Date(updatedAt.toDate())} />
            </div>
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
