import React, { useEffect, useState } from "react";

import { getFacilities } from "../database";
import Loading from "../design-system/Loading";
import useRejectionToast from "../hooks/useRejectionToast";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { getRtDataForFacility } from "../infection-model/rt";
import { useLocaleDataState } from "../locale-data-context";
import FacilityRow from "./FacilityRow";
import FacilityRowPlaceholder from "./FacilityRowPlaceholder";
import {
  useChartDataFromProjectionData,
  useProjectionData,
} from "./projectionCurveHooks";
import { Facility, RtValue, Scenario } from "./types";

const FacilityChart: React.FC<{
  scenarioId: string;
}> = ({ scenarioId }) => {
  const [firstFacility, setFirstFacility] = useState<Facility | null>();
  const [
    firstFacilityRtData,
    setFirstFacilityRtData,
  ] = useState<RtValue | null>();

  const { data: localeDataSource } = useLocaleDataState();

  const handleFacilitySave = (facility: Facility) => {
    console.log(facility);
  };

  const fetchFacility = async () => {
    const facilities = await getFacilities(scenarioId);
    const firstFacility = facilities?.[0];
    if (firstFacility) {
      const firstFacilityRtData = await getRtDataForFacility(firstFacility);
      setFirstFacility(firstFacility);
      setFirstFacilityRtData(firstFacilityRtData);
    }
  };

  useEffect(() => {
    fetchFacility();
  }, [fetchFacility]);

  return (
    <>
      {firstFacility && firstFacilityRtData ? (
        <FacilityRowPlaceholder key={firstFacility?.id}>
          <EpidemicModelProvider
            facilityModel={firstFacility?.modelInputs}
            localeDataSource={localeDataSource}
          >
            <FacilityRow
              facility={firstFacility}
              facilityRtData={firstFacilityRtData}
              onSave={handleFacilitySave}
            />
          </EpidemicModelProvider>
        </FacilityRowPlaceholder>
      ) : (
        <Loading />
      )}
      ;
    </>
  );
};

export default FacilityChart;
