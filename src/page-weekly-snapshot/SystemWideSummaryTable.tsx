import { get, pick, pickBy, sum, values } from "lodash";
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

function getSystemWideSummaryIncarceratedData(facilities: Facility[]) {
  let systemWideSummaryIncarceratedData: IncarceratedFacilitySummaryData = {
    incarceratedPopulation: 0,
    incarceratedPopulationDelta: 0,
    incarceratedPopulationDeltaDirection: "",
    incarceratedCases: 0,
    incarceratedCasesDelta: 0,
    incarceratedCasesDeltaDirection: "",
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
    const incarceratedData = buildIncarceratedFacilitySummaryData(
      facility,
      facility.modelInputs,
    );
    console.log(incarceratedData);

    systemWideSummaryIncarceratedData.incarceratedPopulation +=
      incarceratedData.incarceratedPopulation;
    // if (incarceratedData.incarceratedPopulationDeltaDirection == "negative") {
    //     systemWideSummaryIncarceratedData.incarceratedPopulationDelta -= incarceratedData.incarceratedPopulationDelta;
    // }
    // else {
    //     systemWideSummaryIncarceratedData.incarceratedPopulationDelta += incarceratedData.incarceratedPopulationDelta;
    // }
    systemWideSummaryIncarceratedData.incarceratedCases +=
      incarceratedData.incarceratedCases;
    // if (incarceratedData.incarceratedCasesDeltaDirection == "negative") {
    //     systemWideSummaryIncarceratedData.incarceratedCasesDelta -= incarceratedData.incarceratedCasesDelta;
    // }
    // else {
    //     systemWideSummaryIncarceratedData.incarceratedCasesDelta += incarceratedData.incarceratedCasesDelta;
    // }
  }
  return systemWideSummaryIncarceratedData;
}

function getSystemWideSummaryStaffData(facilities: Facility[]) {
  let systemWideSummaryStaffData: StaffFacilitySummaryData = {
    staffPopulation: 0,
    staffPopulationDelta: 0,
    staffPopulationDeltaDirection: "",
    staffCases: 0,
    staffCasesDelta: 0,
    staffCasesDeltaDirection: "",
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
    const staffData = buildStaffFacilitySummaryData(
      facility,
      facility.modelInputs,
    );
    console.log(staffData);

    systemWideSummaryStaffData.staffPopulation += staffData.staffPopulation;
    // if (staffData.staffPopulationDeltaDirection == "negative") {
    //     systemWideSummaryStaffData.staffPopulationDelta -= staffData.staffPopulationDelta;
    // }
    // else {
    //     systemWideSummaryStaffData.staffPopulationDelta += staffData.staffPopulationDelta;
    // }
    systemWideSummaryStaffData.staffCases += staffData.staffCases;
    // if (staffData.staffCasesDeltaDirection == "negative") {
    //     systemWideSummaryStaffData.staffCasesDelta -= staffData.staffCasesDelta;
    // }
    // else {
    //     systemWideSummaryStaffData.staffCasesDelta += staffData.staffCasesDelta;
    // }
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
