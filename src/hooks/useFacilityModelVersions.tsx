import { useCallback, useEffect, useState } from "react";

import { Facility, ModelInputs } from "../page-multi-facility/types";
import useError from "./useError";

const useFacilityModelVersions = (facility: Facility | undefined) => {
  const [facilityModelVersions, setFacilityModelVersions] = useState<
    ModelInputs[] | undefined
  >([]);

  const rethrowSync = useError();

  const updateModelVersions = useCallback(async () => {
    if (!facility) return;
    try {
      const { modelVersions } = facility;
      setFacilityModelVersions(modelVersions);
    } catch (e) {
      rethrowSync(e);
    }
  }, [facility, rethrowSync]);

  useEffect(() => {
    updateModelVersions();
  }, [updateModelVersions]);

  return [facilityModelVersions, updateModelVersions] as [
    typeof facilityModelVersions,
    typeof updateModelVersions,
  ];
};

export default useFacilityModelVersions;
