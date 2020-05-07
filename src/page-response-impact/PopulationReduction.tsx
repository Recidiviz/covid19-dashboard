import hexAlpha from "hex-alpha";
import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";

const rightWidth = 65;

const Container = styled.div`
  max-width: 407px;
`;
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${hexAlpha(Colors.forestGray, 0.2)};
  font-weight: normal;
`;
const TitleGroup = styled.div`
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  line-height: 16px;
`;
const HeaderTitle = styled.span`
  color: ${Colors.forest};
`;
const HeaderSubTitle = styled.span`
  color: ${hexAlpha(Colors.forest, 0.5)};
`;
const Percent = styled.div`
  font-size: 36px;
  line-height: 1.5;
  font-weight: 500;
  color: ${hexAlpha(Colors.forest, 0.7)};
  width: ${rightWidth}px;
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const RowContent = styled.div`
  font-family: "Helvetica Neue", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 300;
  color: ${hexAlpha(Colors.forest, 0.7)};
  padding-top: 8px;
`;
const RowContentRight = styled(RowContent)`
  width: ${rightWidth - 8}px;
  text-align: left;
`;

interface Props {
  originalPop: number;
  currentPop: number;
}

function percentDiff(orig: number, curr: number): number {
  // reduction is a positive value
  const num = (-1 * (curr - orig)) / orig;
  return Math.round(num * 100);
}

const PopulationReduction: React.FC<Props> = ({ originalPop, currentPop }) => {
  return (
    <Container>
      <HeaderContainer>
        <TitleGroup>
          <HeaderTitle>Incarcerated population</HeaderTitle>
          <HeaderSubTitle>&nbsp;reduced by</HeaderSubTitle>
        </TitleGroup>
        <Percent>{percentDiff(originalPop, currentPop)}%</Percent>
      </HeaderContainer>
      <Row>
        <RowContent>Current population</RowContent>
        <RowContentRight>{currentPop}</RowContentRight>
      </Row>
      <Row>
        <RowContent>Original population</RowContent>
        <RowContentRight>{originalPop}</RowContentRight>
      </Row>
    </Container>
  );
};

export default PopulationReduction;
