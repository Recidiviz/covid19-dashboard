import React from "react";
import styled from "styled-components";

import { DateMMMD } from "../design-system/DateFormats";
import { Spacer } from "../design-system/Spacer";
import NewsFeedEvent from "./NewsFeedEvent";

interface Props {
  events: NewsFeedEvent[];
}

const EventsDiv = styled.div``;

const EventDiv = styled.div`
  display: flex;
  flex-direction: row;

  margin-bottom: 24px;
`;

const DateDiv = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 16px;
  /* identical to box height, or 145% */

  letter-spacing: 0.02em;
  text-transform: uppercase;

  color: #00413e;

  opacity: 0.5;

  padding-top: 4px;
`;

const RhsDiv = styled.div``;

const ActionDiv = styled.div`
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 24px;
  /* or 160% */

  color: #00413e;

  opacity: 0.8;
`;

const SourceDiv = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 16px;
  /* identical to box height, or 145% */

  letter-spacing: 0.02em;
  text-transform: uppercase;

  color: #00413e;

  opacity: 0.5;
`;

const NewsFeed: React.FC<Props> = (props) => {
  return (
    <EventsDiv>
      {props.events.map((event) => {
        let date = new Date(event["ACTION DATE"]);
        return (
          <EventDiv key={event["UNIQUE ID #"]}>
            <DateDiv>
              <DateMMMD date={date} />
            </DateDiv>
            <Spacer x={30} />
            <RhsDiv>
              <ActionDiv>{event["ACTION TAKEN"]}</ActionDiv>
              <Spacer y={8} />
              <SourceDiv>
                {event["SOURCE"] ? (
                  <a href={event["SOURCE"]}>SOURCE</a>
                ) : (
                  <>NO SOURCE</>
                )}
              </SourceDiv>
            </RhsDiv>
          </EventDiv>
        );
      })}
    </EventsDiv>
  );
};

export default NewsFeed;
