import React from "react";
import { ResponsiveOrdinalFrame } from "semiotic";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { RtData, RtRecord } from "../infection-model/rt";
import { RtDataMapping } from "../page-multi-facility/FacilityContext";
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

function filterRtData(data: RtData | null): data is RtData {
  return data !== null;
}

const RtSummaryStats: React.FC<Props> = ({ rtData }) => {
  const rtDataValues: (RtData | null)[] = Object.values(rtData);
  const totalFacilities = rtDataValues.length;

  const facilitiesRtRecords: RtRecord[][] = rtDataValues
    .filter(filterRtData)
    .map((rtData: RtData) => rtData.Rt);

  const numFacilitiesWithRtLt1 =
    rtStats.numFacilitiesWithRtLessThan1(facilitiesRtRecords) || 0;

  const averageRtReductionAcrossFacilities =
    rtStats.averageRtReductionAcrossFacilities(facilitiesRtRecords) || 0;

  const numFacilitiesWithRtGt1 = totalFacilities - numFacilitiesWithRtLt1;

  const frameProps = {
    type: { type: "bar", innerRadius: 70 },
    style: (datum: any) => ({ fill: datum.color }),
    data: [
      { value: numFacilitiesWithRtLt1, color: "#447F7C" },
      { value: numFacilitiesWithRtGt1, color: "#E1E3E3" },
    ],
    size: [200, 200],
    projection: "radial",
    oAccessor: "color",
    rAccessor: () => 1,
    dynamicColumnWidth: "value",
    annotations: [
      {
        type: "chart-title",
        title: `${numFacilitiesWithRtLt1} of ${totalFacilities} facilities`,
        subtitle: "with R(t) < 1.0",
      },
    ],
  };

  return (
    <RtSummaryStatsContainer>
      <ResponsiveOrdinalFrame
        {...frameProps}
        svgAnnotationRules={(d: any) => {
          if (d.d.type === "chart-title") {
            return (
              <g
                textAnchor="middle"
                fill={Colors.forest}
                transform={`translate(${d.adjustedSize[0] / 2}
                 ${d.adjustedSize[0] / 2})`}
              >
                <text
                  width={"50%"}
                  fontSize="18"
                  fontWeight="bold"
                  style={{
                    lineHeight: "22px",
                    fontFamily: "Poppins",
                    width: "50%",
                  }}
                >
                  {d.d.title}
                </text>
                <text
                  style={{
                    lineHeight: "16px",
                    fontFamily: "Poppins",
                    transform: "translate(0px, 20px)",
                  }}
                  fontSize="12"
                  fontWeight="normal"
                >
                  {d.d.subtitle}
                </text>
              </g>
            );
          }
          return null;
        }}
      />
      <RtSummaryTextContainer>
        <LegendContainer>
          <LegendSpan />
          <div>{`Facilities with R(t) < 1.0`}</div>
        </LegendContainer>
        <RtSummaryText className="mt-5 mb-5">
          Average R(t) reduction across all facilities since first confirmed
          case: <strong>{averageRtReductionAcrossFacilities}</strong>
        </RtSummaryText>
      </RtSummaryTextContainer>
    </RtSummaryStatsContainer>
  );
};

export default RtSummaryStats;
