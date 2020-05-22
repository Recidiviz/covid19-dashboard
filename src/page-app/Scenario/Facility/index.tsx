import React, { useContext } from "react";

import { EpidemicModelProvider } from "../../../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../../../locale-data-context";
import { FacilityContext } from "../../../page-multi-facility/FacilityContext";
import FacilityInputForm from "../../../page-multi-facility/FacilityInputForm";

// eslint-disable-next-line react/display-name
export default (props: { scenarioId: string }) => {
  const { data: localeDataSource } = useLocaleDataState();
  const { facility } = useContext(FacilityContext);

  return (
    <>
      <EpidemicModelProvider
        facilityModel={facility?.modelInputs}
        localeDataSource={localeDataSource}
      >
        <FacilityInputForm scenarioId={props.scenarioId} />
      </EpidemicModelProvider>
    </>
  );
};
