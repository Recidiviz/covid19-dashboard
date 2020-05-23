import { RouteComponentProps } from "@reach/router";
import React, { useContext } from "react";

import { EpidemicModelProvider } from "../../../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../../../locale-data-context";
import { FacilityContext } from "../../../page-multi-facility/FacilityContext";
import FacilityInputForm from "../../../page-multi-facility/FacilityInputForm";
import PageInfo from "../../../site-metadata/PageInfo";

interface Props extends RouteComponentProps {
  facility?: any;
  localeDataSource?: any;
  scenario?: any;
  isNew?: boolean;
}

// eslint-disable-next-line react/display-name
export default (props: Props) => {
  const { data: localeDataSource } = useLocaleDataState();
  const { facility } = useContext(FacilityContext);

  return (
    <>
      <PageInfo title="Facility Page" />
      <EpidemicModelProvider
        facilityModel={facility?.modelInputs}
        localeDataSource={localeDataSource}
      >
        <FacilityInputForm />
      </EpidemicModelProvider>
    </>
  );
};
