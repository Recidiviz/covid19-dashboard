import { sum, zip } from "d3-array";
import ndarray from "ndarray";

import Loading from "../design-system/Loading";
import { calculateCurves } from "../infection-model";
import {
  getAllValues,
  getColView,
  getRowView,
} from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";
import { useEpidemicModelState } from "./EpidemicModelContext";
import ImpactProjectionTable, { TableRow } from "./ImpactProjectionTable";

function buildTableRowFromCurves(
  data: ndarray,
  label: string,
  calculator: Function,
): TableRow {
  const [week1, week2, week3, overall] = [
    7,
    14,
    21,
    data.shape[0] - 1,
  ].map((day) => calculator(data, day));

  return {
    label,
    week1,
    week2,
    week3,
    overall,
  };
}

function countEverHospitalizedForDay(data: ndarray, day: number) {
  // includes people who are currently hospitalized or were previously
  const everHospitalized = [
    seirIndex.hospitalized,
    seirIndex.icu,
    seirIndex.hospitalRecovery,
    seirIndex.fatalities,
    seirIndex.recoveredHospitalized,
  ];
  const row = getAllValues(getRowView(data, day));
  return Math.round(sum(row.filter((d, i) => everHospitalized.includes(i))));
}

// row = day and col = SEIR compartment
function countCasesForDay(data: ndarray, day: number): number {
  const row = getAllValues(getRowView(data, day));
  const notCases = [seirIndex.susceptible, seirIndex.exposed];
  return Math.round(sum(row.filter((d, i) => !notCases.includes(i))));
}

function countTotalHospitalizedForDay(data: ndarray, day: number): number {
  const inHospital = [
    seirIndex.hospitalized,
    seirIndex.icu,
    seirIndex.hospitalRecovery,
  ];
  const row = getAllValues(getRowView(data, day));
  return Math.round(sum(row.filter((d, i) => inHospital.includes(i))));
}

function getFatalitiesForDay(data: ndarray, day: number): number {
  return Math.round(data.get(day, seirIndex.fatalities));
}

function countUnableToWorkForDay(data: ndarray, day: number): number {
  const unableToWork = [
    seirIndex.quarantined,
    seirIndex.icu,
    seirIndex.hospitalRecovery,
    seirIndex.hospitalized,
    seirIndex.fatalities,
  ];
  const row = getAllValues(getRowView(data, day));
  return Math.round(sum(row.filter((d, i) => unableToWork.includes(i))));
}

type PeakData = {
  peakPct: number;
  peakDay: number;
  daysUntil50Pct: number | null;
};

function getPeakHospitalized(data: ndarray, hospitalBeds: number): PeakData {
  const hospitalized = zip(
    ...[
      seirIndex.hospitalized,
      seirIndex.icu,
      seirIndex.hospitalRecovery,
    ].map((compartment) => getAllValues(getColView(data, compartment))),
  ).map((values) => sum(values));
  const peakHospitalized = Math.max(...hospitalized);
  const daysUntil50Pct = hospitalized.findIndex(
    (val) => val / hospitalBeds > 0.5,
  );
  return {
    peakDay: hospitalized.indexOf(peakHospitalized),
    peakPct: peakHospitalized / hospitalBeds,
    daysUntil50Pct: daysUntil50Pct > -1 ? daysUntil50Pct : null,
  };
}

function buildHospitalizedRow(data: ndarray): TableRow {
  const row = buildTableRowFromCurves(
    data,
    "In hospital",
    countTotalHospitalizedForDay,
  );
  // overall hospitalized is a different calculation, it's everyone
  // who was ever hospitalized
  row.overall = countEverHospitalizedForDay(data, data.shape[0] - 1);
  return row;
}

const ImpactProjectionTableContainer: React.FC = () => {
  const modelData = useEpidemicModelState();
  const { hospitalBeds } = modelData;
  // TODO: could this be stored on the context instead for reuse?
  const { incarcerated, staff } = calculateCurves(modelData);
  const incarceratedData: TableRow[] = [
    buildTableRowFromCurves(incarcerated, "Cases", countCasesForDay),
  ];
  const incarceratedHospitalized = buildHospitalizedRow(incarcerated);

  incarceratedData.push(incarceratedHospitalized);
  incarceratedData.push({
    label: "% of public hospital beds used for incarc. pop.",
    // none of these numbers are null unless explicitly set,
    // which we haven't done
    week1: (incarceratedHospitalized.week1 as number) / hospitalBeds,
    week2: (incarceratedHospitalized.week2 as number) / hospitalBeds,
    week3: (incarceratedHospitalized.week3 as number) / hospitalBeds,
    overall: null,
  });
  incarceratedData.push(
    buildTableRowFromCurves(incarcerated, "Deceased", getFatalitiesForDay),
  );

  const staffData: TableRow[] = [
    buildTableRowFromCurves(staff, "Infected", countCasesForDay),
    Object.assign(
      buildTableRowFromCurves(staff, "Unable to work", countUnableToWorkForDay),
      { overall: null },
    ),
    buildHospitalizedRow(staff),
    buildTableRowFromCurves(staff, "Deceased", getFatalitiesForDay),
  ];
  const peakStats = getPeakHospitalized(incarcerated, hospitalBeds);
  const peakData: TableRow[] = [
    // TODO: dynamically indicate if this is for state or county
    { label: "Peak hospital bed utilization", value: peakStats.peakPct },
    {
      label: "Days until peak hospital bed utilization",
      value: peakStats.peakDay,
    },
    {
      label:
        "Days until 50% hospital bed utilization in region is by incarcerated population",
      value: peakStats.daysUntil50Pct,
    },
  ].map(({ label, value }) => ({
    label,
    week1: null,
    week2: null,
    week3: null,
    overall: value,
  }));
  return modelData.countyLevelDataLoading ? (
    <Loading />
  ) : (
    <ImpactProjectionTable {...{ incarceratedData, staffData, peakData }} />
  );
};

export default ImpactProjectionTableContainer;
