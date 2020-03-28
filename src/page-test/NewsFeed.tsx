import * as dateFns from "date-fns";
import styled from "styled-components";

const FakeDataSheet = `UNIQUE ID #	STATE	COUNTY	ACTION DATE	OVERALL BUCKET	SUB-CATEGORY	ACTION TAKEN	# OF PEOPLE RELEASED	# OF PEOPLE PREVENTED FROM ENTERING	SUMMARY RE-WRITE
1	CA	<Null>	3/24/20	Curtail physical contact	Minimize facility transfers	Freeze prison intake for new sentences	0	0	CDCR stopped prison intake
3	IN	<Null>	3/27/20	Curtail physical contact	Limit exposure between inmates/supervisees and others	Suspends visitation	0	0	All prison visits were suspended`
  .split("\n")
  .map((line) => line.split("\t"));

const Headers = FakeDataSheet[0];
export const FakeNewsFeedEvents = FakeDataSheet.slice(1).map((row) => {
  let record = {} as NewsFeedEvent;
  for (let i = 0; i < Headers.length; i++) {
    let header = Headers[i];
    let cell = row[i];
    (record as any)[header] = cell;
    1;
  }
  return record;
});

function formatDateMMMD(date: Date) {
  return dateFns.format(date, "MMM d");
}

interface NewsFeedEvent {
  "UNIQUE ID #": string;
  "STATE": string;
  "COUNTY": string;
  "ACTION DATE": string;
  "OVERALL BUCKET": string;
  "SUB-CATEGORY": string;
  "ACTION TAKEN": string;
  "# OF PEOPLE RELEASED": string;
  "# OF PEOPLE PREVENTED FROM ENTERING": string;
  "SUMMARY RE-WRITE": string;
}

interface SpacerProps {
  x?: number;
  y?: number;
}

const Spacer = styled.div<SpacerProps>`
  width: ${(props) => (props.x == null ? 0 : props.x)};
  height: ${(props) => (props.y == null ? 0 : props.y)};
`;

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
            <DateDiv>{formatDateMMMD(date)}</DateDiv>
            <Spacer x={30} />
            <RhsDiv>
              <ActionDiv>{event["ACTION TAKEN"]}</ActionDiv>
              <Spacer y={8} />
              <SourceDiv>Source</SourceDiv>
            </RhsDiv>
          </EventDiv>
        );
      })}
    </EventsDiv>
  );
};

export default NewsFeed;
