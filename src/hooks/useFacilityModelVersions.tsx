import { useCallback, useEffect, useState } from "react";

import { getFacilityModelVersions } from "../database";
import { Facility, ModelInputs } from "../page-multi-facility/types";

const useFacilityModelVersions = (facility: Facility) => {
  const [facilityModelVersions, setFacilityModelVersions] = useState<
    ModelInputs[] | undefined
  >();

  const updateModelVersions = useCallback(async () => {
    const modelVersions = await getFacilityModelVersions({
      facilityId: facility.id,
      scenarioId: facility.scenarioId,
      distinctByObservedAt: true,
    });
    setFacilityModelVersions(modelVersions);
  }, [setFacilityModelVersions, facility]);

  useEffect(() => {
    updateModelVersions();
  }, [updateModelVersions]);

  return [facilityModelVersions, updateModelVersions] as [
    typeof facilityModelVersions,
    typeof updateModelVersions,
  ];
};

export default useFacilityModelVersions;
