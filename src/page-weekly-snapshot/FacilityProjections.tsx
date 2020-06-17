import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import useScenario from "../scenario-context/useScenario";

const FacilityProjectionsContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
`;

const FacilityRow = styled.div`
  padding: 20px;
`;

const FacilityName = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 3px;
`;

const ProjectionSection = styled.div`
  border: 1px solid ${Colors.black};
  padding: 5px;
  margin-top: 10px;
`;

const FacilityProjections: React.FC = () => {
  const [scenario] = useScenario();
  const { state: facilitiesState } = useFacilities();
  const facilities = Object.values(facilitiesState.facilities);

  return (
    <FacilityProjectionsContainer>
      {scenario.loading || facilitiesState.loading ? (
        <Loading />
      ) : (
        facilities.map((facility) => (
          <FacilityRow key={facility.id}>
            <FacilityName>{facility.name}</FacilityName>
            Facility-Specific Projection
            <ProjectionSection>Facility Summary</ProjectionSection>
          </FacilityRow>
        ))
      )}
    </FacilityProjectionsContainer>
  );
};

export default FacilityProjections;
