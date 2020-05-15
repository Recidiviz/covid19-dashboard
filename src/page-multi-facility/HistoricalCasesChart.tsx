import * as dateFns from "date-fns";
import React, { useState } from "react";
import { ResponsiveOrdinalFrame } from "semiotic";
import styled from "styled-components";

import ChartTooltip from "../design-system/ChartTooltip";
import ChartWrapper from "../design-system/ChartWrapper";
import Colors from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import nextArrowIcon from "../design-system/icons/ic_next_arrow.svg";
import prevArrowIcon from "../design-system/icons/ic_previous_arrow.svg";
import useFacilityModelVersions from "../hooks/useFacilityModelVersions";
import { totalConfirmedCases } from "../impact-dashboard/EpidemicModelContext";
import { Facility, ModelInputs } from "./types";

interface Props {
  facility: Facility | undefined;
}

type Summary = {
  data: ModelInputs;
  value: number;
};

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

const ScrollChartDatesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-flow: row nowrap;
  position: relative;
`;

const ScrollChartDatesButton = styled.button`
  color: ${Colors.forest};
  display: inline;
  font: 10px/150% "Poppins", sans serif;
  text-transform: uppercase;
  letter-spacing: 0.15em;
`;

const ArrowIcon = styled.img`
  display: inline;
  margin: 0 10px;
`;

interface ScrollChartDates {
  onPreviousClick: () => void;
  onNextClick: () => void;
}

const ScrollChartDates: React.FC<ScrollChartDates> = ({
  onPreviousClick,
  onNextClick,
}) => {
  return (
    <ScrollChartDatesContainer>
      <ScrollChartDatesButton onClick={onPreviousClick}>
        <ArrowIcon src={prevArrowIcon} alt="previous arrow icon" />
        Previous 15 days
      </ScrollChartDatesButton>
      <ScrollChartDatesButton onClick={onNextClick}>
        Next 15 days
        <ArrowIcon src={nextArrowIcon} alt="next arrow icon" />
      </ScrollChartDatesButton>
    </ScrollChartDatesContainer>
  );
};

const HistoricalCasesChart: React.FC<Props> = ({ facility }) => {
  const numDays = 30;
  const [versions] = useFacilityModelVersions(facility);
  const [endDate, setEndDate] = useState(dateFns.endOfToday());
  const [startDate, setStartDate] = useState(dateFns.subDays(endDate, numDays));

  console.log({ facility });

  React.useEffect(() => {
    setStartDate(dateFns.subDays(endDate, numDays));
  }, [endDate, numDays]);

  function getDatesInterval(startDate: Date, endDate: Date) {
    return dateFns.eachDayOfInterval({ start: startDate, end: endDate });
  }

  function onPreviousClick() {
    setEndDate(dateFns.subDays(endDate, 15));
  }

  function onNextClick() {
    setEndDate(dateFns.addDays(endDate, 15));
  }

  console.log({ versions });

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
        };
      }
    });
  }

  const data = generateBarChartData(
    versions,
    getDatesInterval(startDate, endDate),
  );

  console.log({ data });

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

  const frameProps = {
    data,
    oPadding: 1,
    pixelColumnWidth: 15,
    style: () => {
      return {
        fill: Colors.forest,
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
    oAccessor: (datum: any) => {
      return datum.observedAt;
    },
    size: [400, 300],
    responsiveWidth: true,
    hoverAnnotation: true,
    tooltipContent: Tooltip,
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
        onPreviousClick={onPreviousClick}
        onNextClick={onNextClick}
      />
    </ChartWrapper>
  );
};

export default HistoricalCasesChart;
