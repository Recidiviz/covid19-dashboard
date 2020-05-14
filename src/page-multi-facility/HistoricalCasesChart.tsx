import React from "react";
// import styled from "styled-components";
import { Facility, ModelInputs } from "./types";
import { ResponsiveOrdinalFrame } from "semiotic";
import ChartWrapper from "../design-system/ChartWrapper";
import useFacilityModelVersions from "../hooks/useFacilityModelVersions";

import * as dateFns from "date-fns";
import Colors from "../design-system/Colors";

interface Props {
  facility: Facility | undefined;
}

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

  const frameProps = {
    data,
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
      return dateFns.getDate(datum.observedAt);
    },
    rAccessor: "value",
    oLabel: (datum: string) => {
      if ((Number(datum) % 5) === 0) return <text>{datum}</text>
      else return null
    }
  }

  return (
    <ChartWrapper>
      <ResponsiveOrdinalFrame {...frameProps} />
    </ChartWrapper>
  )
};

export default HistoricalCasesChart;
