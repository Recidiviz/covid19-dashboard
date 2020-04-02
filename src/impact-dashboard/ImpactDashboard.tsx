import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const FormContainer = styled.div`
  border-right: 1px solid black;
  flex: 1 0 auto;
  width: 350px;
`;

const ChartsContainer = styled.div`
  flex: 2 0 auto;
  width: 350px;
  margin: 0 15px;
`;

const ImpactDashboard: React.FC = () => {
  return (
    <Container>
      <FormContainer>forms</FormContainer>
      <ChartsContainer>chart goes here</ChartsContainer>
    </Container>
  );
};

export default ImpactDashboard;
