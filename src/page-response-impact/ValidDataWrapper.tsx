import { sum } from "d3";
import { pick } from "lodash";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { Facilities, Facility } from "../page-multi-facility/types";
const POPULATION_DATA_ERROR_MSG =
  "Impact could not be generated because one or more of your facilities does not have a staff or incarcerated population count. Please add population numbers and try again.";
const LOCALE_DATA_ERROR_MSG =
  "Impact could not be generated because locale information does not match across facilities";

const ValidDataWrapperContainer = styled.div``;
const ErrorMessage = styled.div`
  padding: 20px;
  color: ${Colors.darkForest};
  width: 60%;
`;

function sumAgeGroupPopulations(facility: Facility): number {
  return sum(
    Object.values(
      pick(facility.modelInputs, [
        "age0Population",
        "age20Population",
        "age45Population",
        "age55Population",
        "age65Population",
        "age75Population",
        "age85Population",
        "ageUnknownPopulation",
      ]),
    ),
  );
}

interface Props {
  children?: React.ReactElement<any>;
  facilities?: Facilities;
}

const ValidDataWrapper: React.FC<Props> = ({ children, facilities = [] }) => {
  const [errors, setErrors] = useState({
    locale: false,
    population: false,
  });

  function validateLocaleData(facilities: Facilities) {
    return facilities.some((f) => {
      return (
        facilities[0].modelInputs.stateCode !== f.modelInputs.stateCode ||
        facilities[0].systemType !== f.systemType
      );
    });
  }

  function validatePopulationData(facilities: Facilities) {
    return facilities.some((f) => {
      const staffPopulation = f.modelInputs.staffPopulation || 0;
      return staffPopulation === 0 || sumAgeGroupPopulations(f) === 0;
    });
  }

  useEffect(() => {
    if (facilities.length === 0) return;
    setErrors({
      locale: validateLocaleData(facilities),
      population: validatePopulationData(facilities),
    });
  }, [facilities]);

  return (
    <ValidDataWrapperContainer>
      {Object.values(errors).some((e) => e) ? (
        <div>
          {errors.locale && (
            <ErrorMessage>{LOCALE_DATA_ERROR_MSG}</ErrorMessage>
          )}
          {errors.population && (
            <ErrorMessage>{POPULATION_DATA_ERROR_MSG}</ErrorMessage>
          )}
        </div>
      ) : (
        children
      )}
    </ValidDataWrapperContainer>
  );
};

export default ValidDataWrapper;
