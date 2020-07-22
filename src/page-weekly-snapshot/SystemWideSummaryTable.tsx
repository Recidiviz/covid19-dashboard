import React from "react";

import { useFacilities } from "../facilities-context/FacilitiesContext";
import {
  findMatchingDay,
  findMostRecentDate,
} from "../hooks/useAddCasesInputs";
import { Facility } from "../page-multi-facility/types";
import { Table } from "./FacilityPage";
import { HorizontalRule, LeftHeading } from "./shared/index";
import {
  buildIncarceratedFacilitySummaryData,
  buildStaffFacilitySummaryData,
  FacilitySummaryData,
  IncarceratedFacilitySummaryData,
  makeSummaryColumns,
  makeTableHeadings,
  StaffFacilitySummaryData,
} from "./shared/utils";

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
  let systemWideSummaryIncarceratedData: IncarceratedFacilitySummaryData = {
    incarceratedPopulation: 0,
    incarceratedPopulationDelta: 0,
    incarceratedPopulationDeltaDirection: "same",
    incarceratedCases: 0,
    incarceratedCasesDelta: 0,
    incarceratedCasesDeltaDirection: "same",
  };

  let incarceratedPopulationSystemWideDelta = 0;

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
  }
  systemWideSummaryIncarceratedData.incarceratedPopulationDeltaDirection = getDeltaDirection(
    incarceratedPopulationSystemWideDelta,
  );
  systemWideSummaryIncarceratedData.incarceratedPopulationDelta = Math.abs(
    incarceratedPopulationSystemWideDelta,
  );
  return systemWideSummaryIncarceratedData;
}

function getSystemWideSummaryStaffData(facilities: Facility[]) {
  let systemWideSummaryStaffData: StaffFacilitySummaryData = {
    staffPopulation: 0,
    staffPopulationDelta: 0,
    staffPopulationDeltaDirection: "same",
    staffCases: 0,
    staffCasesDelta: 0,
    staffCasesDeltaDirection: "same",
  };

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
    systemWideSummaryStaffData.staffCases += staffData.staffCases;
  }
  return systemWideSummaryStaffData;
}

const SystemWideSummaryTable: React.FC<{}> = () => {
  const { state: facilitiesState } = useFacilities();

  const facilities = Object.values(facilitiesState.facilities);
  const systemWideSummaryIncarceratedData = getSystemWideSummaryIncarceratedData(
    facilities,
  );

  const systemWideSummaryStaffData = getSystemWideSummaryStaffData(facilities);

  const facilitySummaryData = {
    incarceratedData: systemWideSummaryIncarceratedData,
    staffData: systemWideSummaryStaffData,
  } as FacilitySummaryData;

  return (
    <>
      <HorizontalRule />
      <LeftHeading>Current System Summary</LeftHeading>
      <Table>
        <thead>{makeTableHeadings()}</thead>
        <tbody>{makeSummaryColumns(facilitySummaryData)}</tbody>
      </Table>
      <br />
    </>
  );
};

export default SystemWideSummaryTable;
