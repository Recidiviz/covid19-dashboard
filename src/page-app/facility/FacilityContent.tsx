import React, { useContext } from "react";

import { EpidemicModelProvider } from "../../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../../locale-data-context";
import { FacilityContext } from "../../page-multi-facility/FacilityContext";
import FacilityInputForm from "../../page-multi-facility/FacilityInputForm";

const FacilityContent = (props: { scenarioId: string }) => {
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

export default FacilityContent;
