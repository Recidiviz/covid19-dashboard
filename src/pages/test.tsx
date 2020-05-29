// @ts-nocheck
import React from "react";

import AuthWall from "../auth/AuthWall";
import {
  addFacilityCapacity,
  getMigrationFacilities,
  getMigrationModelVersions,
  getMigrationScenarios,
  removeOccupancyPct,
} from "../database";
import { totalIncarceratedPopulation } from "../impact-dashboard/EpidemicModelContext";
import PageInfo from "../site-metadata/PageInfo";

function calculateFacilityCapacity(modelInputs) {
  const occupancyPct = modelInputs.facilityOccupancyPct;
  const pop = totalIncarceratedPopulation(modelInputs);
  if (pop && occupancyPct) {
    return pop * occupancyPct;
  }
}

// flip this to true to write changes to the database;
// flip it to false for a dry run that just logs to console
const write = false;

const setFacilityCapacity = async ({
  facilityDoc,
  scenarioId,
  modelVersionDoc,
}) => {
  let { modelInputs } = facilityDoc.data();
  let modelVersionId;

  if (modelVersionDoc) {
    modelInputs = modelVersionDoc.data();
    modelVersionId = modelVersionDoc.id;
  }

  const capacity = calculateFacilityCapacity(modelInputs);
  if (capacity) {
    addFacilityCapacity({
      facilityId: facilityDoc.id,
      facilityCapacity: capacity,
      modelInputs,
      scenarioId,
      write,
      modelVersionId,
    });
  } else {
    console.log(
      `unable to calculate capacity for facility ${facilityDoc.id}${
        modelVersionId ? ` version ${modelVersionId}` : ""
      }`,
      modelInputs,
    );
  }
};

const removeDeprecatedFields = async ({
  facilityDoc,
  scenarioId,
  modelVersionDoc,
}) => {
  let { modelInputs } = facilityDoc.data();
  let modelVersionId;

  if (modelVersionDoc) {
    modelInputs = modelVersionDoc.data();
    modelVersionId = modelVersionDoc.id;
  }

  removeOccupancyPct({
    facilityId: facilityDoc.id,
    modelInputs,
    scenarioId,
    write,
    modelVersionId,
  });
};

// eslint-disable-next-line react/display-name
export default () => {
  const migrate = async () => {
    const scenarios = await getMigrationScenarios();
    scenarios.forEach(async (scenarioDoc) => {
      const scenarioId = scenarioDoc.id;
      const facilities = await getMigrationFacilities(scenarioId);
      facilities.forEach(async (facilityDoc) => {
        setFacilityCapacity({ facilityDoc, scenarioId: scenarioId });
        const modelVersions = await getMigrationModelVersions(
          scenarioId,
          facilityDoc.id,
        );
        modelVersions.forEach(async (modelVersionDoc) => {
          setFacilityCapacity({ facilityDoc, scenarioId, modelVersionDoc });
        });
      });
    });
  };

  const cleanupPostRelease = async () => {
    const scenarios = await getMigrationScenarios();
    scenarios.forEach(async (scenarioDoc) => {
      const scenarioId = scenarioDoc.id;
      const facilities = await getMigrationFacilities(scenarioId);
      facilities.forEach(async (facilityDoc) => {
        removeDeprecatedFields({ facilityDoc, scenarioId: scenarioId });
        const modelVersions = await getMigrationModelVersions(
          scenarioId,
          facilityDoc.id,
        );
        modelVersions.forEach(async (modelVersionDoc) => {
          removeDeprecatedFields({ facilityDoc, scenarioId, modelVersionDoc });
        });
      });
    });
  };

  return (
    <>
      <PageInfo title="test page for migration script" />
      <AuthWall>
        <div style={{ margin: 45 }}>
          <button onClick={migrate}>migrate facility capacity</button>
        </div>
        <div style={{ margin: 45 }}>
          <button onClick={cleanupPostRelease}>
            remove deprecated fields (after release)
          </button>
        </div>
      </AuthWall>
    </>
  );
};
