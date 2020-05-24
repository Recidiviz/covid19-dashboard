import React from "react";
import styled from "styled-components";

import { ModelInputs } from "../../page-multi-facility/types";
import ChartTooltip from "../design-system/ChartTooltip";
import Colors from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";

type MissingDataInput = {
  missing: boolean;
  observedAt: Date;
  value: number;
};

export type Summary = {
  data: ModelInputs & MissingDataInput;
  value: number;
};

interface TooltipProps {
  summary: Summary[];
}

const TooltipContainer = styled(ChartTooltip)`
  font-family: "Poppins", sans serif;
  color: ${Colors.slate};
  line-height: 16px;
  min-width: 120px;
`;

const TooltipTitle = styled.div`
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
  const { data, value } = summaryData;
  return (
    <TooltipContainer>
      {data.missing ? (
        <TooltipTitle>No data</TooltipTitle>
      ) : (
        <TooltipTitle>{value} cases</TooltipTitle>
      )}

      <TooltipDate>
        <DateMMMMdyyyy date={data.observedAt} />
      </TooltipDate>
      <TooltipSubtitle>Click to update</TooltipSubtitle>
    </TooltipContainer>
  );
};

export default BarChartTooltip;
