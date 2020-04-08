import styled from "styled-components";

import ChartArea from "./ChartArea";
import { useEpidemicModelState } from "./EpidemicModelContext";
import ImpactProjectionTable from "./ImpactProjectionTableContainer";

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

const ErrorMessage = styled.div`
  margin: 10px;
`;

const ImpactDashboard: React.FC = () => {
  const { countyLevelDataFailed } = useEpidemicModelState();
  return (
    <Container>
      {countyLevelDataFailed ? (
        <ErrorMessage>Error: unable to load data!</ErrorMessage>
      ) : (
        <>
          <FormContainer>forms</FormContainer>
          <ChartsContainer>
            <ChartArea />
            <ImpactProjectionTable />
          </ChartsContainer>
        </>
      )}
    </Container>
  );
};

export default ImpactDashboard;
