import { useEffect, useState } from "react";

import { LocaleData } from "../../contexts/locale-data-context";
import { getFacilities } from "../../database";
import { Facilities } from "../../page-multi-facility/types";

export type FacilitiesState = {
  data: Facilities;
  loading: boolean;
};

export function useFacilities(
  scenarioId: string,
  localeDataSource: LocaleData,
) {
  const [facilities, setFacilities] = useState<FacilitiesState>({
    data: [],
    loading: true,
  });

  useEffect(() => {
    async function fetchFacilities() {
      if (!scenarioId) return;
      const facilitiesData = await getFacilities(scenarioId);
      if (facilitiesData) {
        setFacilities({
          data: facilitiesData,
          loading: false,
        });
      }
    }

    fetchFacilities();
  }, [scenarioId, localeDataSource]);

  return facilities;
}
