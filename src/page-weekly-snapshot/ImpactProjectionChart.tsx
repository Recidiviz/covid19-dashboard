import { curveCatmullRom, format } from "d3";
import * as dateFns from "date-fns";
import React from "react";
import { ResponsiveXYFrame } from "semiotic";
import styled from "styled-components";

import ChartTooltip from "../design-system/ChartTooltip";
import ChartWrapper from "../design-system/ChartWrapper";
import Colors from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import { useLocaleDataState } from "../locale-data-context";
import { getChartData, ninetyDaysAgo, today } from "./projectionChartUtils";
import { useWeeklyReport } from "./weekly-report-context";

const ImpactProjectionContainer = styled.div``;
const CurveChartWrapper = styled(ChartWrapper)<{ chartHeight: number }>`
  height: ${(props) => props.chartHeight}px;

  .threshold-annotation {
    .subject {
      stroke-dasharray: 1 3;
      stroke-linecap: round;
    }
  }
`;
const TooltipTitle = styled.div`
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 0.1em;
  line-height: 1;
  margin-bottom: 12px;
  text-transform: uppercase;
`;

const TooltipDatalist = styled.ul``;
const TooltipDatum = styled.li`
  opacity: 0.8;
`;

const formatThousands = format(",~g");

interface TooltipProps {
  count: number;
  days: number;
  parentLine: {
    title: string;
    [propName: string]: any;
  };
  [propName: string]: any;
}

const Tooltip: React.FC<TooltipProps> = ({
  count,
  date,
  parentLine: { title },
}) => {
  return (
    <ChartTooltip>
      <TooltipTitle>{title}</TooltipTitle>
      <TooltipDatalist>
        <TooltipDatum>
          <DateMMMMdyyyy date={date} />
        </TooltipDatum>
        <TooltipDatum>People: {formatThousands(count)}</TooltipDatum>
      </TooltipDatalist>
    </ChartTooltip>
  );
};

const lineColors: { [key in string]: string } = {
  projectedCases: Colors.opacityForest,
  projectedFatalities: Colors.black50,
  actualCases: Colors.black,
  actualFatalities: Colors.tamarillo,
};

const ImpactProjectionChart: React.FC = () => {
  const {
    data: localeDataSource,
    loading: localeLoading,
  } = useLocaleDataState();
  const { state: facilitiesState } = useFacilities();
  const {
    state: { stateName, loading: scenarioLoading },
  } = useWeeklyReport();

  if (!stateName) return null;

  const facilities = Object.values(facilitiesState.facilities);
  const modelVersions = facilities.map((f) => f.modelVersions);

  const chartData = getChartData(modelVersions, localeDataSource);

  const frameProps = {
    showLinePoints: true,
    lines: Object.entries(chartData).map(([bucket, values]) => ({
      title: bucket,
      key: bucket,
      coordinates: values.map((count, index) => {
        return {
          index,
          count,
          date: dateFns.addDays(ninetyDaysAgo, index),
        };
      }),
    })),
    lineType: { type: "line", interpolator: curveCatmullRom },
    xAccessor: "date",
    yAccessor: "count",
    responsiveHeight: true,
    responsiveWidth: true,
    size: [450, 450],
    yExtent: { extent: [0], includeAnnotations: false },
    margin: { left: 60, bottom: 60, right: 60, top: 10 },
    lineStyle: ({ key }: { key: string }) => ({
      stroke: lineColors[key],
      strokeWidth: 2,
      fill: lineColors[key],
      fillOpacity: 1,
    }),
    axes: [
      {
        orient: "bottom",
        label: "Date",
        tickValues: [ninetyDaysAgo, today],
        tickFormat: (value: Date) => dateFns.format(value, "MM/dd"),
      },
      {
        orient: "left",
        baseline: false,
        tickFormat: formatThousands,
      },
    ],
    hoverAnnotation: true,
    tooltipContent: Tooltip,
    pointStyle: { display: "none" },
  };

  return (
    <ImpactProjectionContainer>
      {!chartData || scenarioLoading || localeLoading ? (
        <Loading />
      ) : (
        <CurveChartWrapper chartHeight={380}>
          <ResponsiveXYFrame {...frameProps} />
        </CurveChartWrapper>
      )}
    </ImpactProjectionContainer>
  );
};

export default ImpactProjectionChart;
