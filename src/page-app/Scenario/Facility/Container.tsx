import React, { useContext, useEffect,useState } from "react";
import { Redirect, RouteComponentProps, useParams } from "react-router-dom";

import { FetchedFacilities } from "../../../constants/Facilities";
import { Routes } from "../../../constants/Routes";
import { getFacilities } from "../../../database";
import Loading from "../../../design-system/Loading";
import { ReplaceUrlParams } from "../../../helpers/Routing";
import useFacilitiesRtData from "../../../hooks/useFacilitiesRtData";
import { FacilityContext } from "../../../page-multi-facility/FacilityContext";
import { Facilities } from "../../../page-multi-facility/types";
import ScenarioContainer from '../Container';

type Props = {
  isNew?: boolean;
  children: any;
};

// eslint-disable-next-line react/display-name
export default (props: Props) => {
  const {facilityId: facilityIdParam, scenarioId: scenarioIdParam} = useParams();
  const { facility, setFacility } = useContext(FacilityContext);

  const [facilities, setFacilities] = useState<FetchedFacilities>({
    data: [] as Facilities,
    loading: true,
  });

  console.log('facilities', facilities)

  async function fetchFacilities() {
    console.log('cath')
    const facilitiesData = await getFacilities(scenarioIdParam);
    console.log('facilitiesData', facilitiesData)
    if (facilitiesData) {
      setFacilities({
        data: facilitiesData,
        loading: false,
      });
      
      const targetFacility = facilitiesData.find(facilityData => facilityData.id === facilityIdParam)
      setFacility(targetFacility);
    }
  }

  useFacilitiesRtData(facilities.data)

  useEffect(() => {
    if (facilityIdParam !== 'new' && facilityIdParam !== '') {
      fetchFacilities();
    }
  }, []);

  const shouldRewriteUrl = !!facility && facilityIdParam !== facility.id;
  const scenarioPath = ReplaceUrlParams(Routes.Scenario.url, {
    scenarioId: scenarioIdParam,
  });

  console.log('facilities.loading', facilities.loading)

  if (facilities.loading) {
    return <Loading />
  } else {
    return !shouldRewriteUrl ? <ScenarioContainer>{React.cloneElement(props.children, {initialFacility: facility})}</ScenarioContainer> : <Redirect to={scenarioPath} />;
  }

};
