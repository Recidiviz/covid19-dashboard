import * as dateFns from "date-fns";
import React, { useEffect, useState } from "react";
import { ResponsiveOrdinalFrame } from "semiotic";

import ChartWrapper from "../../design-system/ChartWrapper";
import Colors from "../../design-system/Colors";
import useFacilityModelVersions from "../../hooks/useFacilityModelVersions";
import { totalConfirmedCases } from "../../impact-dashboard/EpidemicModelContext";
import { Facility, ModelInputs } from "../types";
import BarChartTooltip from "./BarChartTooltip";
import ScrollChartDates from "./ScrollChartDates";

function generateBarChartData(
  versions: ModelInputs[] = [],
  datesInterval: Date[],
) {
  return datesInterval.map((date) => {
    const existingVersion = versions.find((version: any) => {
      return dateFns.isSameDay(version.observedAt, date);
    });

    if (existingVersion) {
      return {
        ...existingVersion,
        value: totalConfirmedCases(existingVersion),
      };
    } else {
      return {
        observedAt: date,
        value: 0,
        missing: true,
      };
    }
  });
}

function getDatesInterval(startDate: Date, endDate: Date) {
  return dateFns.eachDayOfInterval({ start: startDate, end: endDate });
}

function formatDateLabel(dateLabel: string) {
  // I'm not sure I understand yet why creating a new date this way
  // sets it to the day before, so adding 1 to the day for now.
  const date = dateFns.addDays(new Date(dateLabel), 1);
  // Show date label for every 5 days
  if (dateFns.getDate(date) % 5 === 0 && date) {
    return (
      <text>
        {dateFns.format(date, "M")}/{dateFns.format(date, "dd")}
      </text>
    );
  } else {
    return null;
  }
}

interface Props {
  facility: Facility | undefined;
}

const HistoricalCasesChart: React.FC<Props> = ({ facility }) => {
  const numDays = 30;
  const [versions] = useFacilityModelVersions(facility);
  const [endDate, setEndDate] = useState(dateFns.endOfToday());
  const [startDate, setStartDate] = useState(dateFns.subDays(endDate, numDays));

  useEffect(() => {
    setStartDate(dateFns.subDays(endDate, numDays));
  }, [endDate, numDays]);

  function onPreviousClick() {
    setEndDate(dateFns.subDays(endDate, 15));
  }

  function onNextClick() {
    setEndDate(dateFns.addDays(endDate, 15));
  }

  const data = generateBarChartData(
    versions,
    getDatesInterval(startDate, endDate),
  );

  const frameProps = {
    data,
    oPadding: 1,
    pixelColumnWidth: 15,
    style: () => {
      return {
        fill: Colors.opacityForest,
        stroke: "white",
      };
    },
    type: "bar",
    axes: [
      {
        orient: "left",
        ticks: 5,
      },
    ],
    oAccessor: "observedAt",
    size: [400, 300],
    responsiveWidth: true,
    hoverAnnotation: true,
    tooltipContent: BarChartTooltip,
    rAccessor: "value",
    oLabel: (datum: string) => formatDateLabel(datum),
    customClickBehavior: (datum: any) => {
      console.log("clicked: ", datum.summary[0]);
      const summaryData = datum.summary[0];
      const data = summaryData.data;
      console.log("clicked data: ", data);
    },
  };

  return (
    <ChartWrapper>
      <ResponsiveOrdinalFrame {...frameProps} />
      <ScrollChartDates
        endDate={endDate}
        onPreviousClick={onPreviousClick}
        onNextClick={onNextClick}
      />
    </ChartWrapper>
  );
};

export default HistoricalCasesChart;
