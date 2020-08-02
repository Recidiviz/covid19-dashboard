import React from "react";

import {
  findMatchingDay,
  findMostRecentDate,
} from "../hooks/useAddCasesInputs";
import { formatThousands } from "../impact-dashboard/ImpactProjectionTable";
import { Facility } from "../page-multi-facility/types";
import { COLUMN_SPACING, HorizontalRule } from "./shared";
import StatsTable, {
  StatsTableRow,
  ValueDescriptionWithDelta,
} from "./shared/StatsTable";
import {
  buildIncarceratedFacilitySummaryData,
  buildStaffFacilitySummaryData,
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

  const incarceratedData = buildIncarceratedFacilitySummaryData(
    facility,
    mostRecentData,
  );

  const staffData = buildStaffFacilitySummaryData(facility, mostRecentData);

  const tableData = [
    {
      header: "Incarcerated population",
      value: formatThousands(incarceratedData.incarceratedPopulation),
      valueDescription: (
        <ValueDescriptionWithDelta
          deltaDirection={incarceratedData.incarceratedPopulationDeltaDirection}
          delta={incarceratedData.incarceratedPopulationDelta}
        />
      ),
    },
    {
      header: "Incarcerated cases",
      value: formatThousands(incarceratedData.incarceratedCases),
      valueDescription: (
        <ValueDescriptionWithDelta
          deltaDirection={incarceratedData.incarceratedCasesDeltaDirection}
          delta={incarceratedData.incarceratedCasesDelta}
        />
      ),
    },
    {
      header: "Staff population",
      value: formatThousands(staffData.staffPopulation),
      valueDescription: (
        <ValueDescriptionWithDelta
          deltaDirection={staffData.staffPopulationDeltaDirection}
          delta={staffData.staffPopulationDelta}
        />
      ),
    },
    {
      header: "Staff cases",
      value: formatThousands(staffData.staffCases),
      valueDescription: (
        <ValueDescriptionWithDelta
          deltaDirection={staffData.staffCasesDeltaDirection}
          delta={staffData.staffCasesDelta}
        />
      ),
    },
  ];

  return (
    <>
      <HorizontalRule />
      <StatsTable header="Facility Summary">
        <StatsTableRow columns={tableData} columnMarginRight={COLUMN_SPACING} />
      </StatsTable>
    </>
  );
};

export default FacilitySummaryTable;
