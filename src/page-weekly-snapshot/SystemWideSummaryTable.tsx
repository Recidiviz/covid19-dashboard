import { get, pick, pickBy, sum, values } from "lodash";
import React from "react";

import { useFacilities } from "../facilities-context/FacilitiesContext";
import {
  findMatchingDay,
  findMostRecentDate,
} from "../hooks/useAddCasesInputs";
import { Table } from "./FacilityPage";
import { HorizontalRule, LeftHeading } from "./shared/index";
import {
  buildIncarceratedFacilitySummaryData,
  makeTableHeadings,
} from "./shared/utils";

const SystemWideSummaryTable: React.FC<{}> = () => {
  const { state: facilitiesState } = useFacilities();

  const facilities = Object.values(facilitiesState.facilities);
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
  }
  return (
    <>
      <HorizontalRule />
      <LeftHeading>Current System Summary</LeftHeading>
      <Table>
        <thead>{makeTableHeadings()}</thead>
        {/* <tbody>{makeSummaryColumns(facilitySummaryData)}</tbody> */}
      </Table>
      <br />
    </>
  );
};

export default SystemWideSummaryTable;
