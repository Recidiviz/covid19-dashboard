import React from "react";
import styled from "styled-components";

import { ContainerTint1 } from "../styles";
import Form from "./components/Form";

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

const FormPage: React.FC = () => {
  return (
    <Container>
      <FormSection>
        <h1>It takes a village.</h1>
        <h2>
          Thank you for taking the time to contribute. Each submission is
          carefully reviewed, and when accepted, will appear on the site after a
          few days.
        </h2>
      </FormSection>
      <FormSection>
        <Form />
      </FormSection>
    </Container>
  );
};

export default FormPage;
