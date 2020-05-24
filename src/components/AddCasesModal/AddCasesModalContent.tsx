import { startOfToday } from "date-fns";
import hexAlpha from "hex-alpha";
import numeral from "numeral";
import React, { useCallback } from "react";
import styled from "styled-components";

import { ModelInputs } from "../../page-multi-facility/types";
import Colors from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import InputButton from "../design-system/InputButton";
import InputDate from "../design-system/InputDate";
import Tooltip from "../design-system/Tooltip";
import {
  getTotalPopulation,
  ModelInputsPopulationBrackets,
  totalConfirmedCases,
} from "../impact-dashboard/EpidemicModelContext";
import { AgeGroupGrid } from "../impact-dashboard/FacilityInformation";

const noDataColor = Colors.darkRed;

const ModalContents = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  font-weight: normal;
  justify-content: flex-start;
  margin-top: 30px;

  .react-calendar__tile {
    /* these are needed for tooltip display */
    position: relative;
    overflow: visible !important; /* needed to override an inline style */
  }

  .add-cases-calendar__day--no-data {
    background: ${hexAlpha(noDataColor, 0.2)};

    &.react-calendar__tile--now {
      background: ${hexAlpha(noDataColor, 0.1)};
    }

    &.react-calendar__tile--active {
      background: ${hexAlpha(noDataColor, 0.4)};
    }

    &:hover {
      background: ${hexAlpha(noDataColor, 0.5)};
      color: ${Colors.white};
    }
  }
`;

const HorizRule = styled.div`
  border-bottom: 0.5px solid ${Colors.darkGray};
  padding-bottom: 20px;
  margin-bottom: 20px;
  width: 100%;
`;

const CalendarTileTooltipAnchor = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const TooltipContents = styled.div`
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  min-width: 80px;
`;

const TooltipData = styled.div`
  margin-bottom: 0.5em;
  width: 150px;
`;

const TooltipDate = styled.div`
  font-size: 11px;
`;

const formatPopulation = (n: number) => numeral(n).format("0,0");

export type Props = {
  observationDate: Date;
  onValueChange: (value: Date | undefined) => void;
  inputs: ModelInputsPopulationBrackets;
  updateInputs: (update: ModelInputsPopulationBrackets) => void;
  facilityModelVersions: ModelInputs[] | undefined;
  onSave: (event: React.MouseEvent<Element>) => void;
};

const AddCasesModalContent: React.FC<Props> = ({
  observationDate,
  onValueChange,
  inputs,
  updateInputs,
  onSave,
  facilityModelVersions,
}) => {
  const findMatchingDay = useCallback(
    ({ date }: { date: Date }) =>
      facilityModelVersions?.find(
        ({ observedAt }) => date.toDateString() === observedAt.toDateString(),
      ),
    [facilityModelVersions],
  );

  const getTileClassName = useCallback(
    ({ date, view }: { date: Date; view: string }) => {
      const now = new Date();
      if (view === "month" && facilityModelVersions !== undefined) {
        if (
          date <= now &&
          // don't complain about dates before the first day of data for this facility
          date >= facilityModelVersions[0].observedAt &&
          !findMatchingDay({ date })
        ) {
          return `add-cases-calendar__day--no-data`;
        }
      }
      return null;
    },
    [facilityModelVersions, findMatchingDay],
  );

  const renderTooltip = useCallback(
    ({ date }: { date: Date }) => {
      const now = new Date();
      const matchingDay = findMatchingDay({ date });
      return (
        <Tooltip
          content={
            <TooltipContents>
              {date <= now &&
              facilityModelVersions &&
              date >= facilityModelVersions[0].observedAt ? (
                <TooltipData>
                  {matchingDay ? (
                    <span>
                      {formatPopulation(totalConfirmedCases(matchingDay))} cases
                      <br />
                      {formatPopulation(getTotalPopulation(matchingDay))}{" "}
                      residents and staff
                    </span>
                  ) : (
                    "Missing case and population data"
                  )}
                </TooltipData>
              ) : null}
              <TooltipDate>
                <DateMMMMdyyyy date={date} />
              </TooltipDate>
            </TooltipContents>
          }
        >
          <CalendarTileTooltipAnchor />
        </Tooltip>
      );
    },
    [facilityModelVersions, findMatchingDay],
  );

  return (
    <ModalContents>
      <InputDate
        labelAbove={"Date observed"}
        onValueChange={onValueChange}
        tileClassName={getTileClassName}
        tileContent={renderTooltip}
        valueEntered={observationDate || startOfToday()}
      />
      <HorizRule />
      <AgeGroupGrid
        model={inputs}
        updateModel={updateInputs}
        collapsible={true}
      />
      <HorizRule />
      <InputButton label="Save" onClick={onSave} />
    </ModalContents>
  );
};

export default AddCasesModalContent;
