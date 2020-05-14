import React from "react";
import styled from "styled-components";
import { Facility, ModelInputs } from "./types";
import { ResponsiveOrdinalFrame } from "semiotic";
import ChartWrapper from "../design-system/ChartWrapper";
import ChartTooltip from "../design-system/ChartTooltip";
import { DateMMMMdyyyy } from "../design-system/DateFormats";

import useFacilityModelVersions from "../hooks/useFacilityModelVersions";

import * as dateFns from "date-fns";
import Colors from "../design-system/Colors";

interface Props {
  facility: Facility | undefined;
}

type Summary = {
  data: ModelInputs,
  value: number
}

interface TooltipProps {
  summary: Summary[];
}

const TooltipTitle = styled.div`
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 0.1em;
  line-height: 1;
  margin-bottom: 12px;
  text-transform: uppercase;
`;

const Tooltip: React.FC<TooltipProps> = ({ summary }) => {
  const summaryData = summary[0];
  const { data, value } = summaryData;
  return (
    <ChartTooltip>
      <TooltipTitle>{value} cases</TooltipTitle>
      <DateMMMMdyyyy date={data.observedAt} />
    </ChartTooltip>
  );
};

const HistoricalCasesChart: React.FC<Props> = ({ facility }) => {
  const [versions,] = facility
    ? useFacilityModelVersions(facility)
    : [[]]


  console.log({ facility })

  const numDays = 30;
  const endDate = dateFns.endOfToday();
  const startDate = dateFns.subDays(endDate, numDays)

  function getDatesInterval(startDate: Date, endDate: Date) {
    return dateFns.eachDayOfInterval({ start: startDate, end: endDate })
  }

  console.log({versions})

  function generateBarChartData (versions: ModelInputs[] = [], datesInterval: Date[]) {
    return datesInterval.map((date) => {
      const existingVersion = versions.find((version: any) => {
        return dateFns.isSameDay(version.observedAt, date)
      })

      if (existingVersion) {
        return { ...existingVersion, value: existingVersion.ageUnknownCases }
      } else {
        return ({
          observedAt: date,
          value: 0,
        })
      }
    })
  }

  const data = generateBarChartData(versions, getDatesInterval(startDate, endDate))

  console.log({data})

  function formatDateLabel (dateLabel: string) {
    // I'm not sure I understand yet why creating a new date this way
    // sets it to the day before, so adding 1 to the day for now.
    const date = dateFns.addDays(new Date(dateLabel), 1);
    // Show date label for every 5 days
    if ((dateFns.getDate(date) % 5) === 0 && date) {
      return(
        <text>
          {dateFns.format(date, 'M')}/{dateFns.format(date, 'dd')}
        </text>
      )
    } else {
      return null
    }
  }

  const frameProps = {
    data,
    oPadding: 1,
    pixelColumnWidth: 15,
    style: () => {
      return {
        fill: Colors.forest,
        stroke: "white",
      }
    },
    type: "bar",
    axes: [
      {
        orient: "left",
        ticks: 5,
      },
    ],
    oAccessor: (datum: any) => {
      return datum.observedAt;
    },
    hoverAnnotation: true,
    tooltipContent: Tooltip,
    rAccessor: "value",
    oLabel: (datum: string) => formatDateLabel(datum),
  }

  return (
    <ChartWrapper>
      <ResponsiveOrdinalFrame {...frameProps} />
    </ChartWrapper>
  )
};

export default HistoricalCasesChart;
