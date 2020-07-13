import { curveCatmullRom, format } from "d3";
import * as dateFns from "date-fns";
import React from "react";
import { ResponsiveXYFrame } from "semiotic";
import styled from "styled-components";

import ChartWrapper from "../design-system/ChartWrapper";
import Colors from "../design-system/Colors";
import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import { useLocaleDataState } from "../locale-data-context";
import { getChartData, ninetyDaysAgo, today } from "./projectionChartUtils";
import { HorizontalRule } from "./SnapshotPage";
import { useWeeklyReport } from "./weekly-report-context";

const ImpactProjectionContainer = styled.div`
  font-family: "Libre Franklin";
  margin-bottom: 5vw;
`;

const ChartTitle = styled.h3`
  font-size: 11px;
  font-weight: bold;
  line-height: 13px;
  margin: 0 5vw;
`;

const CurveChartWrapper = styled(ChartWrapper)<{ chartHeight: number }>`
  height: ${(props) => props.chartHeight}px;
  display: flex;
  flex-flow: column;

  .threshold-annotation {
    .subject {
      stroke-dasharray: 1 3;
      stroke-linecap: round;
    }
  }

  .axis-title text,
  .axis-label {
    fill: ${Colors.black};
    font-family: "Libre Franklin";
  }
`;

const LegendContainer = styled.div`
  color: ${Colors.black};
  display: flex;
  flex-flow: row nowrap;
  font-size: 11px;
  font-weight: 500;
  margin: 0 5vw;
`;

const LegendText = styled.div<{ legendColor: string }>`
  display: inline-block;
  line-height: 20px;
  letter-spacing: -0.01em;
  margin: 0 10px;

  &::before {
    background-color: ${(props) => props.legendColor};
    border-radius: 50%;
    content: " ";
    display: inline-block;
    height: 8px;
    margin: 0 5px;
    width: 8px;
  }
`;

const formatThousands = format(",~g");

const lineColors: { [key in string]: string } = {
  projectedCases: Colors.forest50,
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

  if (!scenarioLoading && !facilities.length) {
    return <div>Missing scenario data for state: {stateName}</div>;
  }

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
          date: dateFns.addDays(ninetyDaysAgo(), index),
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
        tickValues: [ninetyDaysAgo(), today()],
        tickFormat: (value: Date) => dateFns.format(value, "MM/dd"),
      },
      {
        orient: "left",
        baseline: false,
        tickFormat: formatThousands,
      },
    ],
    pointStyle: { display: "none" },
  };

  return (
    <ImpactProjectionContainer>
      {!chartData || scenarioLoading || localeLoading ? (
        <Loading />
      ) : (
        <>
          <ChartTitle>
            Projection Assuming No Intervention vs. Actual Cumulative Cases
          </ChartTitle>
          <CurveChartWrapper chartHeight={400}>
            <ResponsiveXYFrame {...frameProps} />
          </CurveChartWrapper>
          <HorizontalRule />
          <LegendContainer>
            <LegendText legendColor={lineColors.projectedCases}>
              Projected cases w/o intervention
            </LegendText>
            <LegendText legendColor={lineColors.actualCases}>
              Actual cases
            </LegendText>
            <LegendText legendColor={lineColors.projectedFatalities}>
              Projected fatalities w/o intervention
            </LegendText>
            <LegendText legendColor={lineColors.actualFatalities}>
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
