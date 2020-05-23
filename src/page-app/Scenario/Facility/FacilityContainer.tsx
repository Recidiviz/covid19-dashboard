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
import ScenarioContainer from '../ScenarioContainer';

type Props = {
  isNew?: boolean;
  children: any;
};

// eslint-disable-next-line react/display-name
const FacilityContainer = (props: Props) => {
  const {facilityId: facilityIdParam, scenarioId: scenarioIdParam} = useParams();
  const { facility, setFacility } = useContext(FacilityContext);

  const [facilities, setFacilities] = useState<FetchedFacilities>({
    data: [] as Facilities,
    loading: true,
  });

  async function fetchFacilities() {
    const facilitiesData = await getFacilities(scenarioIdParam);
    if (facilitiesData && facilityIdParam !== 'new') {
      const targetFacility = facilitiesData.find(facilityData => facilityData.id === facilityIdParam)
      if (targetFacility) {
        setFacility(targetFacility);
      } else {
      }
      
      setFacilities({
        data: facilitiesData,
        loading: false,
      });
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

  if (facilityIdParam === 'new') {
    return <ScenarioContainer>{React.cloneElement(props.children, {initialFacility: undefined})}</ScenarioContainer> 
  } else {
    if (facilities.loading) {
      return <Loading />
    } else {
      return !shouldRewriteUrl ? <ScenarioContainer>{React.cloneElement(props.children, {initialFacility: facility})}</ScenarioContainer> : <Redirect to={scenarioPath} />;
    }
  }

};

export default FacilityContainer;