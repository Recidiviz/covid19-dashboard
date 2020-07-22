import { get } from "lodash";
import React from "react";

import {
  findMatchingDay,
  findMostRecentDate,
} from "../hooks/useAddCasesInputs";
import { formatThousands } from "../impact-dashboard/ImpactProjectionTable";
import { Facility } from "../page-multi-facility/types";
import { Table } from "./FacilityPage";
import {
  COLUMN_SPACING,
  Delta,
  DELTA_DIRECTION_MAPPING,
  DeltaContainer,
  Left,
  Right,
  TextContainer,
} from "./shared/index";
import {
  buildIncarceratedFacilitySummaryData,
  buildStaffFacilitySummaryData,
  FacilitySummaryData,
  makeTableHeadings,
} from "./shared/utils";

function makeSummaryRow(total: number, deltaDirection: string, delta: number) {
  return (
    <TextContainer>
      <Left>{formatThousands(total)}</Left>
      <DeltaContainer>
        <Delta deltaDirection={deltaDirection}>
          {get(DELTA_DIRECTION_MAPPING, deltaDirection)}
        </Delta>
        <Right marginRight={COLUMN_SPACING}>{formatThousands(delta)}</Right>
      </DeltaContainer>
    </TextContainer>
  );
}

function makeSummaryColumns(facilitySummaryData: FacilitySummaryData) {
  return (
    <tr>
      <td>
        {makeSummaryRow(
          facilitySummaryData.incarceratedData.incarceratedPopulation,
          facilitySummaryData.incarceratedData
            .incarceratedPopulationDeltaDirection,
          facilitySummaryData.incarceratedData.incarceratedPopulationDelta,
        )}
      </td>
      <td>
        {makeSummaryRow(
          facilitySummaryData.incarceratedData.incarceratedCases,
          facilitySummaryData.incarceratedData.incarceratedCasesDeltaDirection,
          facilitySummaryData.incarceratedData.incarceratedCasesDelta,
        )}
      </td>
      <td>
        {makeSummaryRow(
          facilitySummaryData.staffData.staffPopulation,
          facilitySummaryData.staffData.staffPopulationDeltaDirection,
          facilitySummaryData.staffData.staffPopulationDelta,
        )}
      </td>
      <td>
        {makeSummaryRow(
          facilitySummaryData.staffData.staffCases,
          facilitySummaryData.staffData.staffCasesDeltaDirection,
          facilitySummaryData.staffData.staffCasesDelta,
        )}
      </td>
    </tr>
  );
}

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
