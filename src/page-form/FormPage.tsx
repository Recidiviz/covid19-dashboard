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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.{" "}
        </h2>
      </FormSection>
      <FormSection>
        <Form />
      </FormSection>
    </Container>
  );
};

export default FormPage;
