import hexAlpha from "hex-alpha";
import React from "react";
import styled from "styled-components";

import Colors from "../components/design-system/Colors";
import { calculatePercentDiff } from "./utils/numberUtils";
import { getSubtitle } from "./utils/ResponseImpactCardStateUtils";

const contentWidthPercent = "80%";

const Container = styled.div`
  width: 68%;
`;
const HeaderContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid ${hexAlpha(Colors.forestGray, 0.2)};
  font-weight: normal;
`;
const TitleGroup = styled.div`
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  line-height: 16px;
  width: ${contentWidthPercent};
`;
const HeaderTitle = styled.span`
  color: ${Colors.forest};
`;
const HeaderSubTitle = styled.span`
  color: ${(props) => props.color || hexAlpha(Colors.forest, 0.5)};
`;
const Percent = styled.div`
  font-size: 36px;
  line-height: 1.5;
  font-weight: 500;
  color: ${hexAlpha(Colors.forest, 0.7)};
`;
const Row = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  font-family: "Helvetica Neue", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 300;
  color: ${hexAlpha(Colors.forest, 0.7)};
  padding-top: 8px;
`;
const RowContent = styled.div`
  width: ${contentWidthPercent};
`;
const RowContentRight = styled.div`
  padding-left: 6px;
`;

interface Props {
  originalPop: number;
  currentPop: number;
}

const PopulationReduction: React.FC<Props> = ({ originalPop, currentPop }) => {
  const percentDiff = calculatePercentDiff(originalPop, currentPop);
  const subtitle = getSubtitle(Math.sign(percentDiff));
  return (
    <Container>
      <HeaderContainer>
        <TitleGroup>
          <HeaderTitle>Incarcerated population</HeaderTitle>
          <HeaderSubTitle color={subtitle.color}>
            &nbsp;{subtitle.text}
          </HeaderSubTitle>
        </TitleGroup>
        <Percent>{Math.abs(percentDiff)}%</Percent>
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
