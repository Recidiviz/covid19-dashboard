import React from "react";
import styled from "styled-components";

import ChartTooltip from "../../design-system/ChartTooltip";
import Colors from "../../design-system/Colors";
import { DateMMMMdyyyy } from "../../design-system/DateFormats";
import { ModelInputs } from "../types";

type MissingDataInput = {
  missing: boolean;
  observedAt: Date;
  cases: number;
  population: number;
};

export type Summary = {
  data: ModelInputs & MissingDataInput;
  cases: number;
  population: number;
};

interface TooltipProps {
  summary: Summary[];
}

const TooltipContainer = styled(ChartTooltip)`
  font-family: "Poppins", sans serif;
  color: ${Colors.slate};
  line-height: 16px;
  min-width: 140px;
`;

const TooltipTitle = styled.div`
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 500;
`;

const TooltipDate = styled.div`
  font-size: 12px;
  font-weight: normal;
  margin: 10px 0;
`;

const TooltipSubtitle = styled.div`
  color: ${Colors.teal};
  font-size: 12px;
  font-weight: 600;
`;

const BarChartTooltip: React.FC<TooltipProps> = ({ summary }) => {
  const summaryData = summary[0];
  const { data } = summaryData;
  return (
    <TooltipContainer>
      {data.missing ? (
        <TooltipTitle>No data</TooltipTitle>
      ) : (
        <>
          <TooltipTitle>{data.cases} cases</TooltipTitle>
          <TooltipTitle>{data.population} residents</TooltipTitle>
        </>
      )}

      <TooltipDate>
        <DateMMMMdyyyy date={data.observedAt} />
      </TooltipDate>
      <TooltipSubtitle>Change</TooltipSubtitle>
    </TooltipContainer>
  );
};

export default BarChartTooltip;
