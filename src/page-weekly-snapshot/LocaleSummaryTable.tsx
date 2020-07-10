import { sum } from "d3-array";
import { get, mapKeys, orderBy } from "lodash";
import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { Column, PageContainer } from "../design-system/PageColumn";
import { useFacilities } from "../facilities-context";
import { formatThousands } from "../impact-dashboard/ImpactProjectionTable";
import { LocaleData, useLocaleDataState } from "../locale-data-context";
import { Facility } from "../page-multi-facility/types";

const HorizontalRule = styled.hr`
  border-color: ${Colors.opacityGray};
  margin: 10px 0;
`;

export const Table = styled.table`
  color: ${Colors.black};
  text-align: left;
  width: 100%;
  margin-top: 10px;
`;

const TableHeadingCell = styled.td`
  font-family: "Poppins", sans serif;
  line-height: 24px;
  margin-right: 5px;
  vertical-align: middle;
`;

const BorderDiv = styled.div`
  border-top: 2px solid ${Colors.darkGray};
  margin-right: 5px;
`;

const ProjectionSection = styled.div`
  margin-top: 10px;
  padding: 5px 0;
`;

const ProjectionContainer = styled.div`
  .axis-title text,
  .axis-label {
    fill: ${Colors.black};
    font-family: "Libre Franklin";
  }
`;

const TableCell = styled.td<{ label?: boolean }>`
    font-size: 13px;
    line-height: 200%;
    text-align: "left"};
    opacity: 0.7;
    border-top: 1px solid  ${Colors.darkGray};
    vertical-align: middle;
    width: ${(props) => (props.label ? "200px" : "auto")};
    `;

type StateMetrics = {
  stateName: string;
  casesPerCapita: number | undefined;
  deathsPerCapita: number | undefined;
};

type incarceratedDeathData = {
  incarceratedDeaths: number;
  hasDeathData: boolean;
};

const POPULATION_SIZE = 100000;

function getPerCapita(
  numerator: number | undefined,
  denominator: number | undefined,
) {
  let result = 0;
  if (numerator && denominator) {
    result = Math.round((numerator / denominator) * POPULATION_SIZE);
  }
  return result;
}

function getAllStateData(localeData: LocaleData, stateNames: string[]) {
  const stateMetrics: StateMetrics[] = [];
  // D.C. isn't a state!
  stateNames = stateNames.filter((item) => item !== "District of Columbia");

  for (let i = 0; i < stateNames.length; i++) {
    const localeDataStateTotal = localeData?.get(stateNames[i])?.get("Total");
    if (localeDataStateTotal) {
      const totalCases = localeDataStateTotal["reportedCases"];
      const totalPopulation = localeDataStateTotal["totalPopulation"];
      const totalDeaths = localeDataStateTotal["totalDeaths"];
      const casesPerCapita = getPerCapita(totalCases, totalPopulation);
      const deathsPerCapita = getPerCapita(totalDeaths, totalPopulation);
      stateMetrics.push({
        stateName: stateNames[i],
        casesPerCapita: casesPerCapita,
        deathsPerCapita: deathsPerCapita,
      });
    }
  }
  return stateMetrics;
}

function getStateRank(
  stateTotals: StateMetrics[],
  selectedState: string | undefined,
  filterValue: string,
) {
  const rankedStates = orderBy(
    stateTotals.filter((c) => !!get(c, filterValue)),
    [filterValue],
    ["desc"],
  );

  for (let i = 0; i < rankedStates.length; i++) {
    const currState = rankedStates[i];
    const currStateCasesPerCapita = get(currState, filterValue);
    if (
      selectedState &&
      currState.stateName === selectedState &&
      currStateCasesPerCapita
    ) {
      return [currStateCasesPerCapita, i + 1];
    }
  }
  return [-1, -1];
}

function getTotalIncarceratedPopulation(facilities: Facility[]) {
  let result = 0;
  let hasPopulationData = true;
  for (let i = 0; i < facilities.length; i++) {
    const {
      ageUnknownPopulation,
      age0Population,
      age20Population,
      age45Population,
      age55Population,
      age65Population,
      age75Population,
      age85Population,
    } = facilities[i].modelInputs;
    let ageKnownCaseData = [
      ageUnknownPopulation,
      age0Population,
      age20Population,
      age45Population,
      age55Population,
      age65Population,
      age75Population,
      age85Population,
    ];
    ageKnownCaseData = ageKnownCaseData.filter((data) => data !== undefined);
    // TODO: user has no case data
    if (ageKnownCaseData.length === 0) {
      hasPopulationData = false;
    }
    result += sum(ageKnownCaseData);
  }
  return result;
}

function getTotalIncarceratedCases(facilities: Facility[]) {
  let result = 0;
  let hasCaseData = true;
  for (let i = 0; i < facilities.length; i++) {
    const {
      ageUnknownCases,
      age0Cases,
      age20Cases,
      age45Cases,
      age55Cases,
      age65Cases,
      age75Cases,
      age85Cases,
    } = facilities[i].modelInputs;
    let ageKnownCaseData = [
      ageUnknownCases,
      age0Cases,
      age20Cases,
      age45Cases,
      age55Cases,
      age65Cases,
      age75Cases,
      age85Cases,
    ];
    ageKnownCaseData = ageKnownCaseData.filter((data) => data !== undefined);
    // TODO: user has no case data
    if (ageKnownCaseData.length === 0) {
      hasCaseData = false;
    }
    result += sum(ageKnownCaseData);
  }
  return result;
}

function getTotalIncarceratedDeaths(facilities: Facility[]) {
  let result = 0;
  let deathData = false;
  console.log(facilities);
  for (let i = 0; i < facilities.length; i++) {
    const {
      ageUnknownDeaths,
      age0Deaths,
      age20Deaths,
      age45Deaths,
      age55Deaths,
      age65Deaths,
      age75Deaths,
      age85Deaths,
    } = facilities[i].modelInputs;
    let ageKnownDeathData = [
      ageUnknownDeaths,
      age0Deaths,
      age20Deaths,
      age45Deaths,
      age55Deaths,
      age65Deaths,
      age75Deaths,
      age85Deaths,
    ];
    ageKnownDeathData = ageKnownDeathData.filter((data) => data !== undefined);
    // TODO: user has no case data
    if (ageKnownDeathData.length > 0) {
      deathData = true;
    }
    result += sum(ageKnownDeathData);
  }
  const incarceratedDeathData = {
    incarceratedDeaths: result,
    hasDeathData: deathData,
  };
  return incarceratedDeathData;
}

function makeIncarceratedDeathsRow(
  hasDeathData: boolean,
  incarceratedDeathsPerCapita: number,
) {
  if (hasDeathData) {
    return (
      <tr>
        <TableCell>{formatThousands(incarceratedDeathsPerCapita)}</TableCell>
      </tr>
    );
  } else {
    return (
      <tr>
        <TableCell>???</TableCell>
      </tr>
    );
  }
}

const LocaleSummaryTable: React.FC<{
  stateName: string | undefined;
  stateNames: string[];
}> = ({ stateName, stateNames }) => {
  const localeState = useLocaleDataState();
  const localeData = localeState.data;
  const {
    state: { facilities: facilitiesState },
  } = useFacilities();
  const facilities = Object.values(facilitiesState);

  let casesPerCapita = 0;
  let casesPerCapitaRank = 0;
  let deathsPerCapita = 0;
  let deathsPerCapitaRank = 0;

  let incarceratedCasesPerCapita = 0;
  let incarceratedDeathsPerCapita = 0;

  let hasDeathData = true;

  const allStateMetrics = getAllStateData(localeData, stateNames);
  if (stateName) {
    const selectedStateCasesRank = getStateRank(
      allStateMetrics,
      stateName,
      "casesPerCapita",
    );

    casesPerCapita = selectedStateCasesRank?.[0];
    casesPerCapitaRank = selectedStateCasesRank?.[1];

    const selectedStateDeathsRank = getStateRank(
      allStateMetrics,
      stateName,
      "deathsPerCapita",
    );

    deathsPerCapita = selectedStateDeathsRank?.[0];
    deathsPerCapitaRank = selectedStateDeathsRank?.[1];

    const totalIncarceratedCases = getTotalIncarceratedCases(facilities);
    const totalIncarceratedDeaths = getTotalIncarceratedDeaths(facilities);
    const totalIncarceratedPopulation = getTotalIncarceratedPopulation(
      facilities,
    );
    incarceratedCasesPerCapita = getPerCapita(
      totalIncarceratedCases,
      totalIncarceratedPopulation,
    );
    console.log(totalIncarceratedDeaths);
    incarceratedDeathsPerCapita = getPerCapita(
      totalIncarceratedDeaths.incarceratedDeaths,
      totalIncarceratedPopulation,
    );
    hasDeathData = totalIncarceratedDeaths.hasDeathData;
  }

  return (
    <PageContainer>
      <HorizontalRule />
      <Column>
        <Table>
          <tbody>
            <tr>
              <td />
              <TableHeadingCell>
                Cases (per 100k)
                <tr>
                  <TableCell label>Incarcerated Cases</TableCell>
                </tr>
                <tr>
                  <TableCell>
                    {formatThousands(incarceratedCasesPerCapita)}
                  </TableCell>
                </tr>
                <tr>
                  <TableCell label>Overall State Cases</TableCell>
                </tr>
                <tr>
                  <TableCell>
                    {formatThousands(casesPerCapita)} {casesPerCapitaRank} of 50
                  </TableCell>
                </tr>
              </TableHeadingCell>
            </tr>
          </tbody>
        </Table>
      </Column>
      <Column>
        <Table>
          <tbody>
            <tr>
              <td />
              <TableHeadingCell>
                Fatalities (per 100k)
                <tr>
                  <TableCell label>Incarcerated Fatalities</TableCell>
                </tr>
                {makeIncarceratedDeathsRow(
                  hasDeathData,
                  incarceratedDeathsPerCapita,
                )}
                {/* <tr>
                  <TableCell>
                    {formatThousands(incarceratedDeathsPerCapita)}
                  </TableCell>
                </tr> */}
                <tr>
                  <TableCell label>Overall State Fatalities</TableCell>
                </tr>
                <tr>
                  <TableCell>
                    {formatThousands(deathsPerCapita)} {deathsPerCapitaRank} of
                    50
                  </TableCell>
                </tr>
              </TableHeadingCell>
            </tr>
          </tbody>
        </Table>
      </Column>
    </PageContainer>
  );
};

export default LocaleSummaryTable;
