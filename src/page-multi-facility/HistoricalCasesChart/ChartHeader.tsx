import React from "react";
import styled from "styled-components";

import Colors from "../../design-system/Colors";
import addIcon from "./icons/ic_plus.svg";

const ChartHeaderDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1px solid rgba(70, 116, 114, 0.2);
  border-top: 1px solid rgba(70, 116, 114, 0.2);
  margin-bottom: 1.5rem;
`;

const ChartTabContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const ChartTab = styled.label`
  font-size: 9px;
  font-weight: 600;
  line-height: 16px;
  font-style: normal;
  font-family: "Poppins", sans serif;
  color: ${Colors.forest};
  padding-bottom: 4px;
  border-bottom: 1px solid ${Colors.forest};
  cursor: pointer;
  margin-right: 1.625rem;
`;

const AddHistoricalDataButton = styled.button`
  background: ${Colors.green};
  height: 27px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-right: 1px solid ${Colors.darkGray};
  border-left: 1px solid ${Colors.darkGray};
`;

const AddHistoricalDataLabel = styled.label`
  font-family: "Poppins", sans serif;
  font-style: normal;
  font-weight: 600;
  font-size: 9px;
  line-height: 16px;
  color: ${Colors.white};
  opacity: 0.7;
  display: inline;
  margin-left: 1rem;
  margin-right: 1rem;
`;

const AddButtonImg = styled.img`
  display: inline;
  margin-left: 1rem;
  opacity: 0.7;
`;

interface ChartHeaderProps {
  setModalOpen: (modalOpen: boolean) => void;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ setModalOpen }) => {
  return (
    <ChartHeaderDiv>
      <ChartTabContainer>
        <ChartTab>Cases</ChartTab>
      </ChartTabContainer>
      <AddHistoricalDataButton onClick={() => setModalOpen(true)}>
        <AddButtonImg src={addIcon} />
        <AddHistoricalDataLabel>Add historical data</AddHistoricalDataLabel>
      </AddHistoricalDataButton>
    </ChartHeaderDiv>
  );
};

export default ChartHeader;
