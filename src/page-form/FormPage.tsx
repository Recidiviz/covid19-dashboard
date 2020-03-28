import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { ContainerTint1 } from "../styles";

const FormSection = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 40%;
  padding: 48px;
`;

const Container = styled(ContainerTint1)`
  display: flex;
  justify-content: center;
  padding-x: 48px;
`;

const Form: React.FC<{}> = () => {
  return (
    <Container>
      <FormSection>
        <h1>It takes a village.</h1>
        <h2>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.{" "}
        </h2>
      </FormSection>
      <FormSection>
        <h1>Title</h1>
      </FormSection>
    </Container>
  );
};

export default Form;
