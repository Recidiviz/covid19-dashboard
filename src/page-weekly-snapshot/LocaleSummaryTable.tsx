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

const Table = styled.table`
  color: ${Colors.black};
  text-align: left;
  width: 100%;
  margin-top: 10px;
`;

const HorizontalRule = styled.hr<{ width?: string; marginLeft?: string }>`
  border-color: ${Colors.opacityGray};
  width: ${(props) => props.width || "100%"};
  margin-left: ${(props) => props.marginLeft || "0"};
`;

const TableHeadingCell = styled.td`
  font-family: "Libre Franklin";
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  vertical-align: middle;
`;

const RightHeading = styled.div`
  text-align: right;
`;

const LeftHeading = styled.div`
  text-align: left;
`;

const TextContainerHeading = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const TextContainer = styled.div`
  width: 100%;
  margin: 15px 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  color: ${Colors.black};
`;

const Right = styled.div`
  text-align: right;
  margin-bottom: -5px;
`;

const Left = styled.div`
  text-align: left;
  font-size: 24px;
  font-family: "Libre Baskerville";
`;

const BorderDiv = styled.div`
  border-top: 2px solid ${Colors.black};
`;

const TableCell = styled.td<{ label?: boolean }>`
  font-size: 11px;
  line-height: 200%;
  text-align: "left";
  opacity: 0.7;
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
    const currStateDataPerCapita = get(currState, filterValue);
    if (
      selectedState &&
      currState.stateName === selectedState &&
      currStateDataPerCapita
    ) {
      return [currStateDataPerCapita, i + 1];
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
        <TextContainer>
          <Left>{formatThousands(incarceratedDataPerCapita)}</Left>
        </TextContainer>
      </tr>
    );
  } else {
    return (
      <tr>
        <TextContainer>
          <Left>???</Left>
        </TextContainer>
      </tr>
    );
  }
}

function makeTableColumn(
  heading: string,
  incarceratedData: number,
  stateData: number,
  stateRank: number,
  hasData: boolean,
) {
  const incarceratedDataRow = makeIncarceratedDataRow(
    hasData,
    incarceratedData,
  );
  return (
    <>
      <tr>
        <TableHeadingCell>
          <TextContainerHeading>
            <RightHeading>{heading} </RightHeading>
            <LeftHeading>(per 100k)</LeftHeading>
          </TextContainerHeading>
        </TableHeadingCell>
      </tr>
      <BorderDiv />
      <tr>
        <TableCell>
          Incarcerated {heading}
          <HorizontalRule />
        </TableCell>
      </tr>
      {incarceratedDataRow}
      <BorderDiv />
      <tr>
        <TableCell>
          Overall State {heading}
          <HorizontalRule />
        </TableCell>
      </tr>
      <tr>
        <TableCell>
          <TextContainer>
            <Left>{formatThousands(stateData)}</Left>
            <Right>
              {formatOrdinal(stateRank)} lowest of {NUM_STATES}
            </Right>
          </TextContainer>
        </TableCell>
      </tr>
    </>
  );
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

  let hasCaseData = true;
  let hasDeathData = true;

  const allStateMetrics = getAllStateData(localeData, stateNames);

  // TODO: currently getting state name from the drop down but might
  // need to get this some other way when/if that changes
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
    hasCaseData = totalIncarceratedCases.hasData;
    incarceratedDeathsPerCapita = getPerCapita(
      totalIncarceratedDeaths.incarceratedData,
      totalIncarceratedPopulation.incarceratedData,
    );
    hasDeathData = totalIncarceratedDeaths.hasData;
  }

  return (
    <>
      <HorizontalRule width={"93%"} marginLeft={"20px"} />
      <PageContainer>
        <Column>
          <Table>
            <tbody>
              <td />
              {makeTableColumn(
                "Cases",
                incarceratedCasesPerCapita,
                casesPerCapita,
                casesPerCapitaRank,
                hasCaseData,
              )}
            </tbody>
          </Table>
        </Column>
        <Column>
          <Table>
            <tbody>
              <td />
              {makeTableColumn(
                "Fatalities",
                incarceratedDeathsPerCapita,
                deathsPerCapita,
                deathsPerCapitaRank,
                hasDeathData,
              )}
            </tbody>
          </Table>
        </Column>
      </PageContainer>
    </>
  );
};

export default LocaleSummaryTable;
