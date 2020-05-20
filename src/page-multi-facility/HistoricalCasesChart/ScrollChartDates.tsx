import * as dateFns from "date-fns";
import React from "react";
import styled from "styled-components";

import Colors from "../../design-system/Colors";
import nextArrowIcon from "../../design-system/icons/ic_next_arrow.svg";
import prevArrowIcon from "../../design-system/icons/ic_previous_arrow.svg";

const ScrollChartDatesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-flow: row nowrap;
  position: relative;
`;

const ScrollChartDatesButton = styled.button`
  color: ${Colors.forest};
  display: inline;
  font: 10px/150% "Poppins", sans serif;
  text-transform: uppercase;
  letter-spacing: 0.15em;
`;

const ArrowIcon = styled.img`
  display: inline;
  margin: 0 10px;
`;

interface ScrollChartDates {
  endDate: Date;
  onPreviousClick: () => void;
  onNextClick: () => void;
}

const ScrollChartDates: React.FC<ScrollChartDates> = ({
  endDate,
  onPreviousClick,
  onNextClick,
}) => {
  const showNext15DaysButton = !dateFns.isSameDay(
    endDate,
    dateFns.endOfToday(),
  );
  return (
    <ScrollChartDatesContainer>
      <ScrollChartDatesButton onClick={onPreviousClick}>
        <ArrowIcon src={prevArrowIcon} alt="previous arrow icon" />
        Previous 15 days
      </ScrollChartDatesButton>
      {showNext15DaysButton && (
        <ScrollChartDatesButton onClick={onNextClick}>
          Next 15 days
          <ArrowIcon src={nextArrowIcon} alt="next arrow icon" />
        </ScrollChartDatesButton>
      )}
    </ScrollChartDatesContainer>
  );
};

export default ScrollChartDates;
