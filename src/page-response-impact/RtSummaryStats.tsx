import numeral from "numeral";
import React from "react";
import { ResponsiveOrdinalFrame } from "semiotic";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import HelpButtonWithTooltip from "../design-system/HelpButtonWithTooltip";
import { RtData, RtRecord, isRtData } from "../infection-model/rt";
import { RtDataMapping } from "../page-multi-facility/types";
import * as rtStats from "./rtStatistics";

interface Props {
  rtData: RtDataMapping;
}

const RtSummaryStatsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;

  > .responsive-container {
    flex: 1 1;
  }
`;
const RtSummaryTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1;
  justify-content: flex-end;
`;

const LegendContainer = styled.div`
  display: flex;
  color: ${Colors.opacityForest};
  flex-flow: row nowrap;
  font-family: "Poppins", sans serif;
  font-size: 9px;
  font-weight: normal;
  line-height: 16px;
`;

const LegendText = styled.div`
  margin-right: 5px;
`;

const LegendSpan = styled.span`
  align-self: center;
  background-color: #447f7c;
  height: 10px;
  margin-right: 8px;
  width: 26px;
`;

const RtSummaryText = styled.div`
  color: ${Colors.opacityForest};
  font-family: "Helvetica Neue", sans serif;
  font-size: 12px;
  font-style: normal;
  font-weight: normal;
  line-height: 150%;
`;

const DonutChartTitle = styled.text`
  font-family: "Poppins", sans serif;
  font-size: 18px;
  font-weight: bold;
  line-height: 22px;
  width: 50%;
`;

const DonutChartSubtitle = styled.text`
  font-family: "Poppins", sans serif;
  font-size: 12px;
  font-weight: normal;
  line-height: 16px;
  transform: translate(0px, 20px);
`;


function rtDonutChartAnnotation(d: any) {
  return (
    <g
      textAnchor="middle"
      fill={Colors.forest}
      transform={`translate(${d.adjustedSize[0] / 2}
       ${d.adjustedSize[0] / 2})`}
    >
      <DonutChartTitle>{d.d.title}</DonutChartTitle>
      <DonutChartSubtitle>{d.d.subtitle}</DonutChartSubtitle>
    </g>
  );
}

const RtSummaryStats: React.FC<Props> = ({ rtData }) => {
  const rtDataValues: (RtData | null)[] = Object.values(rtData);
  const totalFacilitiesInScenario = rtDataValues.length;

  const facilitiesRtRecords: RtRecord[][] = rtDataValues
    .filter(isRtData)
    .map((rtData: RtData) => rtData.Rt);

  const numFacilitiesWithRtLt1 =
    rtStats.numFacilitiesWithRtLessThan1(facilitiesRtRecords) || 0;

  const averageRtReductionAcrossFacilities =
    rtStats.averageRtReductionAcrossFacilities(facilitiesRtRecords) || 0;

  const numFacilitiesRemaining =
    totalFacilitiesInScenario - numFacilitiesWithRtLt1;

  const frameProps = {
    type: { type: "bar", innerRadius: 70 },
    style: (datum: any) => ({ fill: datum.color }),
    data: [
      { value: numFacilitiesWithRtLt1, color: Colors.jade },
      { value: numFacilitiesRemaining, color: Colors.lightGray },
    ],
    size: [200, 200],
    projection: "radial",
    oAccessor: "color",
    rAccessor: () => 1,
    dynamicColumnWidth: "value",
    annotations: [
      {
        type: "chart-title",
        title: `${numFacilitiesWithRtLt1} of ${totalFacilitiesInScenario} facilities`,
        subtitle: "with R(t) < 1.0",
      },
    ],
    svgAnnotationRules: (d: any) => {
      if (d.d.type === "chart-title") {
        return rtDonutChartAnnotation(d);
      }
      return null;
    },
  };

  return (
    <RtSummaryStatsContainer>
      <ResponsiveOrdinalFrame {...frameProps} />
      <RtSummaryTextContainer>
        <LegendContainer>
          <LegendSpan />
          <LegendText>{`Facilities with R(t) < 1.0`}</LegendText>
          <HelpButtonWithTooltip>
            {`R(t) < 1.0 means the virus will stop spreading. An R(t) > 1.0
              means the virus will spread quickly. Each facility needs at
              least two days of case data to calculate an R(t).`}
          </HelpButtonWithTooltip>
        </LegendContainer>
        <RtSummaryText className="mt-5 mb-5">
          Average R(t) reduction across all facilities since first confirmed
          case:{" "}
          <strong>
            {numeral(averageRtReductionAcrossFacilities).format("0.0")}
          </strong>
        </RtSummaryText>
      </RtSummaryTextContainer>
    </RtSummaryStatsContainer>
  );
};

export default RtSummaryStats;
