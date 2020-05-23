import React, { useContext, useEffect, useState } from "react";
import { Redirect, useParams } from "react-router-dom";

import { FetchedFacilities } from "../../../constants/Facilities";
import { Routes } from "../../../constants/Routes";
import { getFacilities } from "../../../database";
import { ReplaceUrlParams } from "../../../helpers/Routing";
import { FacilityContext } from "../../../page-multi-facility/FacilityContext";
import { Facilities } from "../../../page-multi-facility/types";
import useScenario from "../../../scenario-context/useScenario";
import ScenarioContainer from "../Container";

type Props = RouteComponentProps<{
  isRoot?: boolean;
  isNew?: boolean;
  children: any;
}>;

// eslint-disable-next-line react/display-name
export default (props: Props) => {
  const {facilityId: facilityIdParam} = useParams();
  const [scenario] = useScenario();
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

      const newFacility = facilitiesData.find((facility) => facility.id === facilityIdParam);
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

  const shouldRewriteUrl = !!facility && facilityIdParam !== facility.id;
  const scenarioPath = ReplaceUrlParams(Routes.Scenario.url, {
    scenarioId: scenario.data.id,
  });

  if (shouldRewriteUrl && !facilities.loading) {
    return <Redirect to={scenarioPath} />;
  } else {
    return <ScenarioContainer>{props.children}</ScenarioContainer>;
  }
};
