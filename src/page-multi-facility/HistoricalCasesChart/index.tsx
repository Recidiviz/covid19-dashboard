import * as dateFns from "date-fns";
import React, { useEffect, useState } from "react";
import { ResponsiveOrdinalFrame } from "semiotic";
import styled from "styled-components";

import ChartWrapper from "../../design-system/ChartWrapper";
import Colors from "../../design-system/Colors";
import useFacilityModelVersions from "../../hooks/useFacilityModelVersions";
import { totalConfirmedCases } from "../../impact-dashboard/EpidemicModelContext";
import { Facility, ModelInputs } from "../types";
import BarChartTooltip, { Summary } from "./BarChartTooltip";
import ChartHeader from "./ChartHeader";
import HistoricalAddCasesModal from "./HistoricalAddCasesModal";
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

const XAxisText = styled.text`
  fill: ${Colors.paleForest};
  font-size: 10px;
  font-weight: 500;
`;

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
      <XAxisText>
        {dateFns.format(date, "M")}/{dateFns.format(date, "dd")}
      </XAxisText>
    );
  } else {
    return null;
  }
}

interface Props {
  facility: Facility;
  onModalSave: (f: Facility) => void;
}

const HistoricalCasesChart: React.FC<Props> = ({ facility, onModalSave }) => {
  const numDays = 30;
  const [versions] = useFacilityModelVersions(facility);
  const [endDate, setEndDate] = useState(dateFns.endOfToday());
  const [startDate, setStartDate] = useState(dateFns.subDays(endDate, numDays));
  const [modalOpen, setModalOpen] = useState(false);
  const [observedAt, setObservedAt] = useState(endDate);

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
    getDatesInterval(startDate, dateFns.addDays(startDate, numDays)),
  );

  const [hoveredPieceKey, setHoveredPieceKey] = useState<number | null>();

  if (!facility) return null;

  const frameProps = {
    data,
    oPadding: 1,
    style: (d: { renderKey: number }) => {
      return {
        fill: d.renderKey == hoveredPieceKey ? Colors.teal : Colors.forest,
        stroke: Colors.white,
      };
    },
    customHoverBehavior: (d: { pieces: { renderKey: number }[] }) => {
      if (d) {
        setHoveredPieceKey(d.pieces[0].renderKey);
      } else {
        setHoveredPieceKey(null);
      }
    },
    type: "bar",
    axes: [
      {
        orient: "left",
        ticks: 5,
      },
    ],
    margin: { top: 0, bottom: 50, left: 50, right: 25 },
    oAccessor: "observedAt",
    size: [400, 300],
    responsiveWidth: true,
    hoverAnnotation: true,
    tooltipContent: BarChartTooltip,
    rAccessor: "value",
    oLabel: (datum: string) => formatDateLabel(datum),
    customClickBehavior: ({ summary }: { summary: Summary[] }) => {
      const { data } = summary[0];
      setObservedAt(data.observedAt);
      setModalOpen(true);
    },
  };

  return (
    <ChartWrapper>
      <ChartHeader setModalOpen={setModalOpen} />
      <ResponsiveOrdinalFrame {...frameProps} />
      <ScrollChartDates
        endDate={endDate}
        onPreviousClick={onPreviousClick}
        onNextClick={onNextClick}
      />
      <HistoricalAddCasesModal
        open={modalOpen}
        setOpen={setModalOpen}
        facility={facility}
        observedAt={observedAt}
        onModalSave={onModalSave}
      />
    </ChartWrapper>
  );
};

export default HistoricalCasesChart;
