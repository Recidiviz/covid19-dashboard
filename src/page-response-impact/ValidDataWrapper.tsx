import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { Facilities } from "../page-multi-facility/types";
// const POPULATION_DATA_ERROR_MSG = "Impact could not be generated because one or more of your facilities does not have a staff or incarcerated population count. Please add population numbers and try again."
const LOCALE_DATA_ERROR_MSG =
  "Impact could not be generated because locale information does not match across facilities";
const ValidDataWrapperContainer = styled.div``;
const ErrorMessage = styled.div`
  padding: 10px;
  color: ${Colors.darkForest};
`;

interface Props {
  children?: React.ReactElement<any>;
  facilities?: Facilities;
}

const ValidDataWrapper: React.FC<Props> = ({ children, facilities = [] }) => {
  const [errors, setErrors] = useState([] as string[]);

  function validateLocaleData(facilities: Facilities) {
    const validData = facilities.every((f) => {
      return (
        facilities[0].modelInputs.stateCode !== f.modelInputs.stateCode &&
        facilities[0].systemType !== f.systemType
      );
    });
    if (!validData) {
      setErrors([LOCALE_DATA_ERROR_MSG]);
    }
  }

  useEffect(() => {
    if (facilities.length === 0) return;
    validateLocaleData(facilities);
  }, [facilities, validateLocaleData]);

  return (
    <ValidDataWrapperContainer>
      {errors.length > 0
        ? errors.map((error) => {
            return <ErrorMessage key={error}>{error}</ErrorMessage>;
          })
        : children}
    </ValidDataWrapperContainer>
  );
};

export default ValidDataWrapper;
