import { get } from "lodash";
import React from "react";

import {
  findMatchingDay,
  findMostRecentDate,
} from "../hooks/useAddCasesInputs";
import { Facility } from "../page-multi-facility/types";
import { Table } from "./FacilityPage";
import {
  buildIncarceratedFacilitySummaryData,
  buildStaffFacilitySummaryData,
  FacilitySummaryData,
  makeSummaryColumns,
  makeTableHeadings,
} from "./shared/utils";

const FacilitySummaryTable: React.FC<{
  facility: Facility;
}> = ({ facility }) => {
  const hasEarlierData = facility.modelVersions.length > 1;
  let mostRecentData = undefined;

  if (hasEarlierData) {
    const currentDate = facility.updatedAt;
    const mostRecentDate = findMostRecentDate(
      currentDate,
      facility.modelVersions,
      false,
    );
    mostRecentData = findMatchingDay({
      date: mostRecentDate,
      facilityModelVersions: facility.modelVersions,
    });
  }

  const incarceratedSummaryData = buildIncarceratedFacilitySummaryData(
    facility,
    mostRecentData,
  );

  const staffSummaryData = buildStaffFacilitySummaryData(
    facility,
    mostRecentData,
  );

  const facilitySummaryData = {
    incarceratedData: incarceratedSummaryData,
    staffData: staffSummaryData,
  } as FacilitySummaryData;

  return (
    <Table>
      <thead>{makeTableHeadings()}</thead>
      <tbody>{makeSummaryColumns(facilitySummaryData)}</tbody>
    </Table>
  );
};

export default FacilitySummaryTable;
