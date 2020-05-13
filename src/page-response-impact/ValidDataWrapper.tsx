import { Link } from "gatsby";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import iconBackSrc from "../design-system/icons/ic_back.svg";
import { Spacer } from "../design-system/Spacer";
import { sumAgeGroupPopulations } from "../impact-dashboard/EpidemicModelContext";
import { Facilities } from "../page-multi-facility/types";
import { BackDiv, IconBack } from "./styles";

const POPULATION_DATA_ERROR_MSG =
  "Impact could not be generated because one or more of your facilities does not have an incarcerated population count. Please add population numbers and try again.";
const LOCALE_DATA_ERROR_MSG =
  'Impact report cannot be generated because your "Locale Information" does not match across facilities. Please make sure you have entered the same "Type of System", "State", and "County" for each facility and try again.';

const ValidDataWrapperContainer = styled.div``;
const ErrorMessage = styled.div`
  padding: 20px;
  color: ${Colors.darkForest};
  width: 60%;
`;

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
        facilities[0].systemType !== f.systemType ||
        facilities[0].modelInputs.stateCode !== f.modelInputs.stateCode ||
        (facilities[0].systemType === "County Jail" &&
          facilities[0].modelInputs.countyName !== f.modelInputs.countyName)
      );
    });
  }

  function validatePopulationData(facilities: Facilities) {
    return facilities.some((f) => {
      return sumAgeGroupPopulations(f) === 0;
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
          <Spacer y={24} />
          <Link to="/">
            <BackDiv className="ml-5">
              <IconBack alt="back" src={iconBackSrc} />
              Back to model
            </BackDiv>
          </Link>
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
