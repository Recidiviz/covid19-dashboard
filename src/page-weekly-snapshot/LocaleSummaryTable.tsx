import { sum } from "d3-array";
import { orderBy } from "lodash";
import React, { useState } from "react";
import styled from "styled-components";

import Colors, { MarkColors as markColors } from "../design-system/Colors";
import { Column, PageContainer } from "../design-system/PageColumn";
import { useFacilities } from "../facilities-context";
import {
  formatThousands,
  TableRow,
} from "../impact-dashboard/ImpactProjectionTable";
import {
  LocaleData,
  LocaleDataProvider,
  LocaleRecord,
  useLocaleDataState,
} from "../locale-data-context";
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

function getCurrentStateData(stateMetrics: StateMetrics[], stateName: string) {
  for (let i = 0; i < stateMetrics.length; i++) {
    if (stateMetrics[i].stateName === stateName) {
      return stateMetrics[i];
    }
  }
  return undefined;
}

function getAllStateData(localeData: LocaleData, stateNames: string[]) {
  const stateMetrics: StateMetrics[] = [];
  // D.C. isn't a state!
  stateNames = stateNames.filter((item) => item !== "District of Columbia");

  for (let i = 0; i < stateNames.length; i++) {
    const localeDataStateTotal = localeData?.get(stateNames[i])?.get("Total");
    // console.log(localeDataStateTotal);
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

function getStateTotalCasesRank(
  stateTotals: StateMetrics[],
  selectedState: string | undefined,
) {
  const rankedStates = orderBy(
    stateTotals.filter((c) => !!c.casesPerCapita),
    ["casesPerCapita"],
    ["desc"],
  );

  for (let i = 0; i < rankedStates.length; i++) {
    const currState = rankedStates[i];
    if (
      selectedState &&
      currState.stateName === selectedState &&
      currState.casesPerCapita
    ) {
      return [currState.casesPerCapita, i + 1];
    }
  }
  return [undefined, undefined];
}

function getStateTotalDeathsRank(
  stateTotals: StateMetrics[],
  selectedState: string | undefined,
) {
  const rankedStates = orderBy(
    stateTotals.filter((c) => !!c.deathsPerCapita),
    ["deathsPerCapita"],
    ["desc"],
  );

  for (let i = 0; i < rankedStates.length; i++) {
    const currState = rankedStates[i];
    if (
      selectedState &&
      currState.stateName === selectedState &&
      currState.deathsPerCapita
    ) {
      return [currState.deathsPerCapita, i + 1];
    }
  }
  return [undefined, undefined];
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
  let hasDeathData = true;
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
    let ageKnownCaseData = [
      ageUnknownDeaths,
      age0Deaths,
      age20Deaths,
      age45Deaths,
      age55Deaths,
      age65Deaths,
      age75Deaths,
      age85Deaths,
    ];
    ageKnownCaseData = ageKnownCaseData.filter((data) => data !== undefined);
    // TODO: user has no case data
    if (ageKnownCaseData.length === 0) {
      hasDeathData = false;
    }
    result += sum(ageKnownCaseData);
  }
  return result;
}

const LocaleSummaryTable: React.FC<{
  stateName: string | undefined;
  stateNames: string[];
}> = ({ stateName, stateNames }) => {
  console.log("here");
  const localeState = useLocaleDataState();
  const localeData = localeState.data;
  const {
    state: { loading, facilities: facilitiesState, rtData },
  } = useFacilities();
  const facilities = Object.values(facilitiesState);

  // const [casesPerCapita, setCasesPerCapita] = useState<number | undefined>();
  // const [casesPerCapitaRank, setCasesPerCapitaRank] = useState<
  //   number | undefined
  // >();
  // const [incarceratedCasesPerCapita, setIncarceratedCasesPerCapita] = useState<
  //   number | undefined
  // >();
  // const [deathsPerCapita, setDeathsPerCapita] = useState<number | undefined>();
  // const [deathsPerCapitaRank, setDeathsPerCapitaRank] = useState<
  //   number | undefined
  // >();
  // const [
  //   incarceratedDeathsPerCapita,
  //   setIncarceratedDeathsPerCapita,
  // ] = useState<number | undefined>();

  let incarceratedCasesPerCapita = 0;

  const allStateMetrics = getAllStateData(localeData, stateNames);
  if (stateName) {
    const currStateMetrics = getCurrentStateData(allStateMetrics, stateName);
    const selectedStateCasesRank = getStateTotalCasesRank(
      allStateMetrics,
      stateName,
    );

    //   setCasesPerCapita(selectedStateCasesRank[0]);
    //   setCasesPerCapitaRank(selectedStateCasesRank[1]);

    const selectedStateDeathsRank = getStateTotalDeathsRank(
      allStateMetrics,
      stateName,
    );
    //   setDeathsPerCapita(selectedStateDeathsRank[0]);
    //   setDeathsPerCapitaRank(selectedStateDeathsRank[1]);
    const totalIncarceratedCases = getTotalIncarceratedCases(facilities);
    const totalIncarceratedDeaths = getTotalIncarceratedDeaths(facilities);
    const totalIncarceratedPopulation = getTotalIncarceratedPopulation(
      facilities,
    );
    incarceratedCasesPerCapita = getPerCapita(
      totalIncarceratedCases,
      totalIncarceratedPopulation,
    );
    const incarceratedDeathsPerCapita = getPerCapita(
      totalIncarceratedDeaths,
      totalIncarceratedPopulation,
    );
    //   setIncarceratedCasesPerCapita(incarceratedCasesPerCapita);
    //   setIncarceratedDeathsPerCapita(incarceratedDeathsPerCapita);
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
                {/* <tr>
              <TableCell>{formatThousands(casesPerCapita)}</TableCell>
            </tr> */}
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
                {/* <tr>
                <TableCell>{formatThousands(incarceratedDeathsPerCapita)}</TableCell>
              </tr> */}
                <tr>
                  <TableCell label>Overall State Fatalities</TableCell>
                </tr>
                {/* <tr>
                <TableCell>{formatThousands(deathsPerCapita)}</TableCell>
              </tr> */}
              </TableHeadingCell>
            </tr>
          </tbody>
        </Table>
      </Column>
    </PageContainer>
  );
};

export default LocaleSummaryTable;
