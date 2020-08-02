import { curveCatmullRom, format } from "d3";
import * as dateFns from "date-fns";
import React from "react";
import { ResponsiveXYFrame } from "semiotic";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import { useLocaleDataState } from "../locale-data-context";
import ImpactToDateTable from "./ImpactToDateTable";
import { LegendContainer, LegendText } from "./shared";
import { CHART_MARGINS, ChartHeader, HorizontalRule } from "./shared";
import * as chartUtils from "./shared/projectionChartUtils";
import { useWeeklyReport } from "./weekly-report-context";

const ImpactProjectionContainer = styled.div`
  font-family: "Libre Franklin";
  margin-bottom: 5vw;
`;

const CurveChartContainer = styled.div`
  margin-bottom: 50px;
`;

const CurveChartWrapper = styled.div`
  height: 700px;
  display: flex;
  flex-flow: column;

  .annotation-note-title {
    color: ${Colors.black};
    font-family: "Libre Baskerville";
    font-size: 40px;
    line-height: 40px;
    text-align: right;
  }

  .annotation-note-label {
    font-family: "Libre Franklin";
    font-size: 11px;
    font-weight: 500;
    line-height: 12px;
    text-align: right;
  }

  .axis-title text,
  .axis-label {
    fill: ${Colors.black};
    font-family: "Libre Franklin";
  }
`;

const formatThousands = format(",~g");

const lineColors: { [key in string]: string } = {
  projectedCases: Colors.forest50,
  projectedFatalities: Colors.black50,
  cases: Colors.black,
  fatalities: Colors.tamarillo,
};

const ImpactProjectionChart: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const { state: facilitiesState } = useFacilities();
  const {
    state: { stateName, loading: scenarioLoading },
  } = useWeeklyReport();

  if (!stateName) return null;

  const facilities = Object.values(facilitiesState.facilities);
  const modelVersions = facilities.map((f) => f.modelVersions);

  if (!scenarioLoading && !facilitiesState.loading && !facilities.length) {
    return <div>Missing scenario data for state: {stateName}</div>;
  }
  const { chartData, tableData } = chartUtils.getImpactChartAndTableData(
    modelVersions,
    localeDataSource,
  );

  const projectedCasesToday =
    chartData.projectedCases[chartData.projectedCases.length - 1];
  const actualCasesToday = chartData.cases[chartData.cases.length - 1];
  const actualCasesDay90 = chartData.cases[0];

  const frameProps = {
    showLinePoints: false,
    lines: Object.entries(chartData).map(([bucket, values]) => ({
      title: bucket,
      key: bucket,
      coordinates: values.map((count, index) => {
        return {
          index,
          count,
          date: dateFns.addDays(chartUtils.ninetyDaysAgo(), index),
        };
      }),
    })),
    lineType: { type: "line", interpolator: curveCatmullRom },
    xAccessor: "date",
    yAccessor: "count",
    responsiveHeight: true,
    responsiveWidth: true,
    size: [450, 450],
    yExtent: {
      extent: [0, projectedCasesToday + 1000],
      includeAnnotations: false,
    },
    margin: CHART_MARGINS,
    lineStyle: ({ key }: { key: string }) => {
      const baseStyle = {
        stroke: lineColors[key],
        strokeWidth: 2,
        fill: lineColors[key],
        fillOpacity: 1,
      };
      if (key === "projectedCases" || key === "projectedFatalities") {
        return { ...baseStyle, strokeDasharray: "5px" };
      }
      return baseStyle;
    },
    axes: [
      {
        orient: "bottom",
        label: "Date",
        baseline: "under",
        tickLineGenerator: () => null,
        tickValues: chartUtils.xAxisTickValues(),
        tickFormat: (value: Date) => dateFns.format(value, "MM/dd"),
      },
      {
        orient: "left",
        baseline: "under",
        tickLineGenerator: () => null,
        tickFormat: formatThousands,
      },
    ],
    annotationSettings: {
      layout: {
        type: "bump",
        orient: "left",
        padding: 10,
        lineHeight: 5,
      },
    },
    annotations: [
      {
        type: "react-annotation",
        color: Colors.black,
        disable: ["connector"],
        date: dateFns.subDays(chartUtils.today(), 20),
        count: actualCasesToday,
        note: {
          title: "Today",
          label: `${formatThousands(actualCasesToday)} actual cumulative cases`,
          wrapSplitter: (label: string) => label,
          orientation: "topBottom",
          align: "top",
        },
      },
      {
        type: "react-annotation",
        color: Colors.black,
        date: chartUtils.ninetyDaysAgo(),
        count: actualCasesDay90,
        note: {
          label: "Date of first recorded case",
        },
      },
      {
        type: "react-annotation",
        color: Colors.black,
        disable: ["connector"],
        date: dateFns.subDays(chartUtils.today(), 10),
        count: projectedCasesToday,
        note: {
          padding: -30,
          label: `${formatThousands(
            projectedCasesToday,
          )} cases originally projected assuming no intervention`,
        },
      },
    ],
  };

  return (
    <ImpactProjectionContainer>
      {scenarioLoading || facilitiesState.loading ? (
        <Loading />
      ) : (
        <>
          <ImpactToDateTable {...tableData} />
          <ChartHeader>
            Projection Assuming No Intervention vs. Actual Cumulative Cases
          </ChartHeader>
          <HorizontalRule />
          <CurveChartContainer>
            <CurveChartWrapper>
              <ResponsiveXYFrame {...frameProps} />
            </CurveChartWrapper>
          </CurveChartContainer>
          <HorizontalRule />
          <LegendContainer>
            <LegendText legendColor={lineColors.projectedCases}>
              Projected cases w/o intervention
            </LegendText>
            <LegendText legendColor={lineColors.cases}>Actual cases</LegendText>
            <LegendText legendColor={lineColors.projectedFatalities}>
              Projected fatalities w/o intervention
            </LegendText>
            <LegendText legendColor={lineColors.fatalities}>
              Actual fatalities
            </LegendText>
          </LegendContainer>
          <HorizontalRule />
        </>
      )}
    </ImpactProjectionContainer>
  );
};

export default ImpactProjectionChart;
