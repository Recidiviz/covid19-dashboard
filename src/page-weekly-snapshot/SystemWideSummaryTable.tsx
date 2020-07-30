import React from "react";

import { useFacilities } from "../facilities-context/FacilitiesContext";
import {
  findMatchingDay,
  findMostRecentDate,
} from "../hooks/useAddCasesInputs";
import { formatThousands } from "../impact-dashboard/ImpactProjectionTable";
import { Facility } from "../page-multi-facility/types";
import { COLUMN_SPACING } from "./shared";
import StatsTable, {
  StatsTableRow,
  ValueDescriptionWithDelta,
} from "./shared/StatsTable";
import {
  buildIncarceratedFacilitySummaryData,
  buildStaffFacilitySummaryData,
  IncarceratedFacilitySummaryData,
  StaffFacilitySummaryData,
} from "./shared/utils";
import { useWeeklyReport } from "./weekly-report-context/WeeklyReportContext";

function getDeltaDirection(delta: number) {
  if (delta < 0) {
    return "negative";
  } else if (delta > 0) {
    return "positive";
  }
  return "same";
}

function addDelta(delta: number, deltaDirection: string) {
  if (deltaDirection == "negative") {
    delta *= -1;
  }
  return delta;
}

function getSystemWideSummaryIncarceratedData(facilities: Facility[]) {
  const systemWideSummaryIncarceratedData: IncarceratedFacilitySummaryData = {
    incarceratedPopulation: 0,
    incarceratedPopulationDelta: 0,
    incarceratedPopulationDeltaDirection: "same",
    incarceratedCases: 0,
    incarceratedCasesDelta: 0,
    incarceratedCasesDeltaDirection: "same",
  };

  let incarceratedPopulationSystemWideDelta = 0;
  let incarceratedCasesSystemWideDelta = 0;

  for (let i = 0; i < facilities.length; i++) {
    const facility = facilities[i];
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

    systemWideSummaryIncarceratedData.incarceratedPopulation +=
      incarceratedData.incarceratedPopulation;
    incarceratedPopulationSystemWideDelta += addDelta(
      incarceratedData.incarceratedPopulationDelta,
      incarceratedData.incarceratedPopulationDeltaDirection,
    );

    systemWideSummaryIncarceratedData.incarceratedCases +=
      incarceratedData.incarceratedCases;
    incarceratedCasesSystemWideDelta += addDelta(
      incarceratedData.incarceratedCasesDelta,
      incarceratedData.incarceratedCasesDeltaDirection,
    );
  }
  systemWideSummaryIncarceratedData.incarceratedPopulationDeltaDirection = getDeltaDirection(
    incarceratedPopulationSystemWideDelta,
  );
  systemWideSummaryIncarceratedData.incarceratedPopulationDelta = Math.abs(
    incarceratedPopulationSystemWideDelta,
  );
  systemWideSummaryIncarceratedData.incarceratedCasesDeltaDirection = getDeltaDirection(
    incarceratedCasesSystemWideDelta,
  );
  systemWideSummaryIncarceratedData.incarceratedCasesDelta = Math.abs(
    incarceratedCasesSystemWideDelta,
  );
  return systemWideSummaryIncarceratedData;
}

function getSystemWideSummaryStaffData(facilities: Facility[]) {
  const systemWideSummaryStaffData: StaffFacilitySummaryData = {
    staffPopulation: 0,
    staffPopulationDelta: 0,
    staffPopulationDeltaDirection: "same",
    staffCases: 0,
    staffCasesDelta: 0,
    staffCasesDeltaDirection: "same",
  };

  let staffPopulationSystemWideDelta = 0;
  let staffCasesSystemWideDelta = 0;

  for (let i = 0; i < facilities.length; i++) {
    const facility = facilities[i];
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
    const staffData = buildStaffFacilitySummaryData(facility, mostRecentData);

    systemWideSummaryStaffData.staffPopulation += staffData.staffPopulation;
    staffPopulationSystemWideDelta += addDelta(
      staffData.staffPopulationDelta,
      staffData.staffPopulationDeltaDirection,
    );

    systemWideSummaryStaffData.staffCases += staffData.staffCases;
    staffCasesSystemWideDelta += addDelta(
      staffData.staffCasesDelta,
      staffData.staffCasesDeltaDirection,
    );
  }
  systemWideSummaryStaffData.staffPopulationDeltaDirection = getDeltaDirection(
    staffPopulationSystemWideDelta,
  );
  systemWideSummaryStaffData.staffPopulationDelta = Math.abs(
    staffPopulationSystemWideDelta,
  );
  systemWideSummaryStaffData.staffCasesDeltaDirection = getDeltaDirection(
    staffCasesSystemWideDelta,
  );
  systemWideSummaryStaffData.staffCasesDelta = Math.abs(
    staffCasesSystemWideDelta,
  );
  return systemWideSummaryStaffData;
}

const SystemWideSummaryTable: React.FC<{}> = () => {
  const { state: facilitiesState } = useFacilities();
  const {
    state: { stateName, loading: scenarioLoading },
  } = useWeeklyReport();

  if (!stateName) return null;

  const facilities = Object.values(facilitiesState.facilities);

  if (!scenarioLoading && !facilitiesState.loading && !facilities.length) {
    return <div>Missing scenario data for state: {stateName}</div>;
  }

  const incarceratedData = getSystemWideSummaryIncarceratedData(facilities);

  const staffData = getSystemWideSummaryStaffData(facilities);

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
      <StatsTable tableHeading="Current System Summary">
        <StatsTableRow columns={tableData} columnMarginRight={COLUMN_SPACING} />
      </StatsTable>
      <br />
    </>
  );
};

export default SystemWideSummaryTable;
