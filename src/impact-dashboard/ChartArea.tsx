// @ts-nocheck
import { zip } from "d3-array";
import { useEffect, useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { calculateCurves, CurveData } from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";
import CurveChart from "./CurveChartContainer";
import CurveChartLegend from "./CurveChartLegend";
import { useEpidemicModelState } from "./EpidemicModelContext";

export type MarkColors = {
  exposed: string;
  infectious: string;
  fatalities: string;
  hospitalized: string;
  hospitalBeds: string;
};

interface GroupStatus {
  [propName: string]: boolean;
}

const Container = styled.div``;

const LegendAndActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 40px;
`;

const LegendContainer = styled.div`
  flex: 0 0 auto;
`;

function combinePopulations(data: CurveData, columnIndex: number) {
  return zip(
    getAllValues(getColView(data.incarcerated, columnIndex)),
    getAllValues(getColView(data.staff, columnIndex)),
  ).map(([incarcerated, staff]) => incarcerated + staff);
}

const ChartArea: React.FC<> = () => {
  const modelData = useEpidemicModelState();

  const projectionData = calculateCurves(modelData);

  const curveData = {
    exposed: combinePopulations(projectionData, seirIndex.exposed),
    fatalities: combinePopulations(projectionData, seirIndex.fatalities),
    hospitalized: combinePopulations(projectionData, seirIndex.hospitalized),
    infectious: combinePopulations(projectionData, seirIndex.infectious),
  };

  const markColors = {
    exposed: Colors.green,
    fatalities: Colors.black,
    hospitalized: Colors.lightBlue,
    hospitalBeds: Colors.red,
    infectious: Colors.red,
  };

  const [groupStatus, setGroupStatus] = useState({
    exposed: false,
    fatalities: false,
    hospitalized: false,
    infectious: false,
  });

  const [displayData, setDisplayData] = useState({});

  const toggleGroup = (groupName: keyof typeof groupStatus) => {
    setGroupStatus({ ...groupStatus, [groupName]: !groupStatus[groupName] });
  };

  const updateDisplayData = () => {
    let filteredGroupStatus = Object.keys(groupStatus).filter(
      (groupName) => groupStatus[groupName],
    );
    setDisplayData(
      filteredGroupStatus.reduce(
        (data, key) => Object.assign(data, { [key]: curveData[key] }),
        {},
      ),
    );
  };

  useEffect(() => {
    updateDisplayData();
  }, [groupStatus]);

  return (
    <Container>
      <LegendAndActions>
        <LegendContainer>
          <CurveChartLegend
            markColors={markColors}
            toggleGroup={toggleGroup}
            groupStatus={groupStatus}
          />
        </LegendContainer>
      </LegendAndActions>
      <CurveChart markColors={markColors} curveData={displayData} />
    </Container>
  );
};

export default ChartArea;
