import numeral from "numeral";
import React from "react";
import styled from "styled-components";

import { HorizontalRule } from "./shared";
import { TableData } from "./shared/projectionChartUtils";
import StatsTable, { StatsTableRow } from "./shared/StatsTable";

const ImpactToDateTableContainer = styled.div`
  margin: 10px 0;
`;

const formatValue = (n: number) => numeral(n).format("0,0");

const ImpactToDateTable: React.FC<TableData> = ({
  staffCasesToday,
  staffFatalitiesToday,
  incarceratedCasesToday,
  incarceratedFatalitiesToday,
  projectedStaffCasesToday,
  projectedStaffFatalitiesToday,
  projectedIncarceratedCasesToday,
  projectedIncarceratedFatalitiesToday,
}) => {
  const incarceratedLivesSaved =
    projectedIncarceratedFatalitiesToday - incarceratedFatalitiesToday;
  const staffLivesSaved = projectedStaffFatalitiesToday - staffFatalitiesToday;
  const incarceratedCasesPrevented =
    projectedIncarceratedCasesToday - incarceratedCasesToday;
  const staffCasesPrevented = projectedStaffCasesToday - staffCasesToday;

  const columnData = [
    {
      header: "Incarcerated lives saved",
      value: formatValue(incarceratedLivesSaved),
    },
    {
      header: "Staff lives saved",
      value: formatValue(staffLivesSaved),
    },
    {
      header: "Incarcerated cases prevented",
      value: formatValue(incarceratedCasesPrevented),
    },
    {
      header: "Staff cases prevented",
      value: formatValue(staffCasesPrevented),
    },
  ];
  return (
    <ImpactToDateTableContainer>
      <HorizontalRule />
      <StatsTable header="Intervention Impact To-Date">
        <StatsTableRow columns={columnData} columnMarginRight={"3vw"} />
      </StatsTable>
      <HorizontalRule />
    </ImpactToDateTableContainer>
  );
};

export default ImpactToDateTable;
