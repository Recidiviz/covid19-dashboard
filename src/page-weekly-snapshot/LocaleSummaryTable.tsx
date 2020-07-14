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
const HorizontalRule = styled.hr`
  border-color: ${Colors.black};
  width: 100%;
  margin-bottom: 10px;
`;

const TableHeadingCell = styled.td`
  font-family: "Libre Franklin";
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  vertical-align: middle;
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
  align-items: baseline;
  color: ${Colors.black};
`;

const Right = styled.div`
  text-align: right;
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
  width: ${(props) => (props.label ? "200px" : "auto")};
`;

type StateMetrics = {
  stateName: string;
  casesRate: number | undefined;
  deathsRate: number | undefined;
};

type IncarceratedData = {
  incarceratedData: number;
  hasData: boolean;
};

type StateRank = {
  stateRate: number;
  stateRank: number;
};

const RATE_UNIT = 100000;
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

function getRate(
  numerator: number | undefined,
  denominator: number | undefined,
) {
  let result = 0;
  if (numerator && denominator) {
    result = Math.round((numerator / denominator) * RATE_UNIT);
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
      const casesRate = getRate(totalCases, totalPopulation);
      const deathsRate = getRate(totalDeaths, totalPopulation);
      stateMetrics.push({
        stateName: stateNames[i],
        casesRate: casesRate,
        deathsRate: deathsRate,
      });
    }
  }
  return stateMetrics;
}

function getStateRank(
  stateTotals: StateMetrics[],
  selectedStateName: string | undefined,
  filterValue: string,
) {
  const rankedStates = orderBy(
    stateTotals.filter((c) => !!get(c, filterValue)),
    [filterValue],
    ["asc"],
  );

  let selectedStateRate = 0;
  let selectedStateRank = 0;

  for (let i = 0; i < rankedStates.length; i++) {
    const currState = rankedStates[i];
    const currStateDataRate = get(currState, filterValue);
    if (
      selectedStateName &&
      currState.stateName === selectedStateName &&
      currStateDataRate
    ) {
      selectedStateRate = currStateDataRate;
      selectedStateRank = i + 1;
    }
  }

  const stateRank: StateRank = {
    stateRank: selectedStateRank,
    stateRate: selectedStateRate,
  };
  return stateRank;
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
  const incarceratedData: IncarceratedData = {
    incarceratedData: result,
    hasData: hasData,
  };
  return incarceratedData;
}

function makeIncarceratedDataRow(
  hasData: boolean,
  incarceratedDataRate: number,
) {
  if (hasData) {
    return (
      <tr>
        <TextContainer>
          <Left>{formatThousands(incarceratedDataRate)}</Left>
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
          <HorizontalRule />
          <TextContainerHeading>
            <Right>{heading} </Right>
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

  let casesRate = 0;
  let casesRateRank = 0;

  let deathsRate = 0;
  let deathsRateRank = 0;

  let incarceratedCasesRate = 0;
  let incarceratedDeathsRate = 0;

  let hasCaseData = true;
  let hasDeathData = true;

  const allStateMetrics = getAllStateData(localeData, stateNames);

  // TODO: currently getting state name from the drop down
  // will need to update whenever that changes
  if (stateName) {
    const selectedStateCasesRank = getStateRank(
      allStateMetrics,
      stateName,
      "casesRate",
    );

    casesRate = selectedStateCasesRank.stateRate;
    casesRateRank = selectedStateCasesRank.stateRank;

    const selectedStateDeathsRank = getStateRank(
      allStateMetrics,
      stateName,
      "deathsRate",
    );

    deathsRate = selectedStateDeathsRank.stateRate;
    deathsRateRank = selectedStateDeathsRank.stateRank;

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
    incarceratedCasesRate = getRate(
      totalIncarceratedCases.incarceratedData,
      totalIncarceratedPopulation.incarceratedData,
    );
    hasCaseData = totalIncarceratedCases.hasData;
    incarceratedDeathsRate = getRate(
      totalIncarceratedDeaths.incarceratedData,
      totalIncarceratedPopulation.incarceratedData,
    );
    hasDeathData = totalIncarceratedDeaths.hasData;
  }

  return (
    <>
      <PageContainer>
        <Column>
          <Table>
            <tbody>
              <td />
              {makeTableColumn(
                "Cases",
                incarceratedCasesRate,
                casesRate,
                casesRateRank,
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
                incarceratedDeathsRate,
                deathsRate,
                deathsRateRank,
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
