import { sum } from "d3-array";
import { get, keys, omit, orderBy, pick, values } from "lodash";
import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { Column, PageContainer } from "../design-system/PageColumn";
import { useFacilities } from "../facilities-context";
import {
  caseBracketKeys,
  deathBracketKeys,
  incarceratedPopulationKeys,
} from "../impact-dashboard/EpidemicModelContext";
import { formatThousands } from "../impact-dashboard/ImpactProjectionTable";
import { LocaleData, useLocaleDataState } from "../locale-data-context";
import { Facility } from "../page-multi-facility/types";

export const Table = styled.table`
  color: ${Colors.black};
  text-align: left;
  width: 100%;
  margin-top: 10px;
`;

const HorizontalRule = styled.hr`
  border-color: ${Colors.opacityGray};
`;

const TableHeadingCell = styled.td`
  font-family: "Libre Franklin";
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  vertical-align: middle;
`;

const Right = styled.div`
  text-align: right;
  margin-bottom: -20px;
`;

const Left = styled.div`
  text-align: left;
  margin-top: 20px;
`;

const TextContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-direction: bottom;
`;

const BorderDiv = styled.div`
  border-top: 2px solid ${Colors.black};
`;

const TableCell = styled.td<{ label?: boolean }>`
  font-size: 13px;
  line-height: 200%;
  text-align: "left";
  opacity: 0.7;
  width: ${(props) => (props.label ? "200px" : "auto")};
`;

const TableNumberCell = styled.td<{ label?: boolean }>`
    font-size: 24px;
    font-family: "Libre Baskerville";
    line-height: 200%;
    text-align: "left"};
    vertical-align: middle;
    width: ${(props) => (props.label ? "200px" : "auto")};
    `;

type StateMetrics = {
  stateName: string;
  casesPerCapita: number | undefined;
  deathsPerCapita: number | undefined;
};

type incarceratedData = {
  incarceratedData: number;
  hasData: boolean;
};

const POPULATION_SIZE = 100000;
const NUM_STATES = 50;

const VALUE_MAPPING = {
  deaths: deathBracketKeys,
  cases: caseBracketKeys,
  population: incarceratedPopulationKeys,
};

function formatOrdinal(value: number) {
  let suffix = ["th", "st", "nd", "rd"],
    rem = value % 100;
  return value + (suffix[(rem - 20) % 10] || suffix[rem] || suffix[0]);
}

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

// TODO: code cleanup in this function

function getStateRank(
  stateTotals: StateMetrics[],
  selectedState: string | undefined,
  filterValue: string,
) {
  const rankedStates = orderBy(
    stateTotals.filter((c) => !!get(c, filterValue)),
    [filterValue],
    ["asc"],
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

function getTotalIncarceratedValue(facilities: Facility[], value: string) {
  let result = 0;
  let hasData = false;
  const valueKeys = get(VALUE_MAPPING, value);
  for (let i = 0; i < facilities.length; i++) {
    const modelInputs = facilities[i].modelInputs;
    const data = omit(
      pick(modelInputs, valueKeys),
      "staffDeaths",
      "staffRecovered",
      "staffCases",
    );
    if (keys(data).length > 0) {
      hasData = true;
    }
    result += sum(values(data));
  }
  const incarceratedData: incarceratedData = {
    incarceratedData: result,
    hasData: hasData,
  };
  return incarceratedData;
}

function makeIncarceratedDataRow(
  hasData: boolean,
  incarceratedDataPerCapita: number,
) {
  if (hasData) {
    return (
      <tr>
        <TableNumberCell>
          {formatThousands(incarceratedDataPerCapita)}
        </TableNumberCell>
      </tr>
    );
  } else {
    return (
      <tr>
        <TableNumberCell>???</TableNumberCell>
      </tr>
    );
  }
}

// function makeTableColumns(
//   heading: string,
//   incarceratedData: number,
//   stateData: number,
//   stateRank: number,
//   isDeathColumn: boolean
// ) {

// }

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

    const totalIncarceratedCases = getTotalIncarceratedValue(
      facilities,
      "cases",
    );
    const totalIncarceratedDeaths = getTotalIncarceratedValue(
      facilities,
      "deaths",
    );
    const totalIncarceratedPopulation = getTotalIncarceratedValue(
      facilities,
      "population",
    );
    incarceratedCasesPerCapita = getPerCapita(
      totalIncarceratedCases.incarceratedData,
      totalIncarceratedPopulation.incarceratedData,
    );
    incarceratedDeathsPerCapita = getPerCapita(
      totalIncarceratedDeaths.incarceratedData,
      totalIncarceratedPopulation.incarceratedData,
    );
    hasDeathData = totalIncarceratedDeaths.hasData;
  }

  return (
    <PageContainer>
      <Column>
        <Table>
          <tbody>
            <td />
            <tr>
              <TableHeadingCell>
                <TextContainer>
                  <Right>Cases </Right>
                  <Left>(per 100k)</Left>
                </TextContainer>
              </TableHeadingCell>
            </tr>
            <BorderDiv />

            <tr>
              <TableCell>
                Incarcerated Cases
                <HorizontalRule />
              </TableCell>
            </tr>
            <tr>
              <TableNumberCell>
                {formatThousands(incarceratedCasesPerCapita)}
              </TableNumberCell>
            </tr>
            <BorderDiv />
            <tr>
              <TableCell>
                Overall State Cases
                <HorizontalRule />
              </TableCell>
            </tr>
            <tr>
              <TableCell>
                <TextContainer>
                  <Right>
                    <TableNumberCell>
                      {formatThousands(casesPerCapita)}
                    </TableNumberCell>
                  </Right>
                  <Left>
                    {formatOrdinal(casesPerCapitaRank)} lowest of {NUM_STATES}
                  </Left>
                </TextContainer>
              </TableCell>
            </tr>
          </tbody>
        </Table>
      </Column>
      <Column>
        <Table>
          <tbody>
            <td />
            <tr>
              <TableHeadingCell>
                <TextContainer>
                  <Right>Fatalities </Right>
                  <Left>(per 100k)</Left>
                </TextContainer>
              </TableHeadingCell>
            </tr>
            <BorderDiv />
            <tr>
              <TableCell>
                Incarcerated Fatalities
                <HorizontalRule />
              </TableCell>
            </tr>
            {makeIncarceratedDataRow(hasDeathData, incarceratedDeathsPerCapita)}
            <BorderDiv />

            <tr>
              <TableCell>
                Overall State Fatalities
                <HorizontalRule />
              </TableCell>
            </tr>
            <tr>
              <TableCell>
                <TextContainer>
                  <Right>
                    <TableNumberCell>
                      {formatThousands(deathsPerCapita)}
                    </TableNumberCell>
                  </Right>
                  <Left>
                    {formatOrdinal(deathsPerCapitaRank)} lowest of {NUM_STATES}
                  </Left>
                </TextContainer>
              </TableCell>
            </tr>
          </tbody>
        </Table>
      </Column>
    </PageContainer>
  );
};

export default LocaleSummaryTable;
