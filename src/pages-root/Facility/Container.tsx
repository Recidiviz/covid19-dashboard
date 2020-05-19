import { navigate, RouteComponentProps, useLocation } from "@reach/router";
import React, { useContext, useEffect, useState } from "react";

import Layout from "../../components/Layout";
import { FetchedFacilities } from "../../constants/Facilities";
import { Routes } from "../../constants/Routes";
import { getFacilities } from "../../database";
import { ReplaceUrlParams, RouteParam } from "../../helpers/Routing";
import { FacilityContext } from "../../page-multi-facility/FacilityContext";
import { Facilities } from "../../page-multi-facility/types";
import useScenario from "../../scenario-context/useScenario";

type Props = RouteComponentProps<{
  isRoot?: boolean;
  isNew?: boolean;
  children: any;
}>;

// eslint-disable-next-line react/display-name
export default (props: Props) => {
  const [scenario] = useScenario();
  const location = useLocation();
  const { facility, setFacility } = useContext(FacilityContext);
  const [facilities, setFacilities] = useState<FetchedFacilities>({
    data: [] as Facilities,
    loading: true,
  });

  async function fetchFacility() {
    if (!scenario?.data?.id) return;

    if (!facility && !!facilities) {
      const facilitiesData = await getFacilities(scenario.data.id);

      if (!facilitiesData) {
        return;
      }

      const newFacility = facilitiesData.find(
        (facility) =>
          facility.id ===
          RouteParam(location.pathname, Routes.Facility.name).facilityId,
      );
      console.log("newFacility", newFacility);

      setFacility(newFacility);

      if (facilitiesData) {
        setFacilities({
          data: facilitiesData,
          loading: false,
        });
      }
    }
  }

  useEffect(() => {
    fetchFacility();
  }, [scenario.data?.id]);

  if (!scenario.data) {
    return null;
  }

  const shouldRewriteUrl =
    !!facility &&
    RouteParam(location.pathname, Routes.Facility.name).facilityId !==
      facility.id;
  const scenarioPath = ReplaceUrlParams(Routes.Scenario.url, {
    scenarioId: scenario.data.id,
  });

  if (shouldRewriteUrl && !facilities.loading) {
    navigate(scenarioPath, { replace: true });
    return null;
  } else {
    return <Layout>{props.children}</Layout>;
  }
};
