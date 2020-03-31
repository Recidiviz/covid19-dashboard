import { useEffect, useState } from "react";

/**
 * Represents an action taken.
 */
export default interface NewsFeedEvent {
  "UNIQUE ID #": string;
  "STATE": string;
  "COUNTY": string;
  "ACTION DATE": string;
  // This column doesn't exist in the fake data.
  "SOURCE"?: string;
  "OVERALL BUCKET": string;
  "SUB-CATEGORY": string;
  "ACTION TAKEN": string;
  "# OF PEOPLE RELEASED": string;
  "# OF PEOPLE PREVENTED FROM ENTERING": string;
  "SUMMARY RE-WRITE": string;
}

/**
 * Convert a TSV spreadsheet into NewsFeedEvent objects.
 */
export function parseNewsFeedEventsFromTsv(tsv: string) {
  let table = tsv.split("\n").map((line) => line.split("\t"));

  const Headers = table[0] as (keyof NewsFeedEvent)[];
  return table.slice(1).map((row) => {
    let record = {} as NewsFeedEvent;
    for (let i = 0; i < Headers.length; i++) {
      let header = Headers[i];
      let cell = row[i];
      record[header] = cell;
    }
    return record;
  });
}

// Fake events

const FakeNewsFeedEventTsv = `UNIQUE ID #	STATE	COUNTY	ACTION DATE	OVERALL BUCKET	SUB-CATEGORY	ACTION TAKEN	# OF PEOPLE RELEASED	# OF PEOPLE PREVENTED FROM ENTERING	SUMMARY RE-WRITE
1	CA	<Null>	3/24/20	Curtail physical contact	Minimize facility transfers	Freeze prison intake for new sentences	0	0	CDCR stopped prison intake
3	IN	<Null>	3/27/20	Curtail physical contact	Limit exposure between inmates/supervisees and others	Suspends visitation	0	0	All prison visits were suspended`;

export const FakeNewsFeedEvents = parseNewsFeedEventsFromTsv(
  FakeNewsFeedEventTsv,
);

// Real events

// https://mnaoumov.wordpress.com/2018/02/05/download-google-drive-file-via-ajax-ignoring-cors/
const NewsFeedEventsTsvUrl =
  "https://cors-anywhere.herokuapp.com/https://docs.google.com/spreadsheets/d/e/2PACX-1vRccQtwTk0FiM3PxtBF5kF-O0RcdzOWyxZgolquqnNmReAEV7bmMSJE7PL_MT8HiQAEynhUJZrC0i6T/pub?gid=251892683&single=true&output=tsv";

async function fetchNewsFeedEvents(options?: RequestInit) {
  let request = await fetch(NewsFeedEventsTsvUrl, options);
  let tsv = await request.text();
  return parseNewsFeedEventsFromTsv(tsv);
}

export function useFetchedNewsFeedEvents() {
  let [events, setEvents] = useState<NewsFeedEvent[] | undefined>();
  let [didError, setDidError] = useState<boolean>(false);

  useEffect(() => {
    let controller = new AbortController();

    fetchNewsFeedEvents({ signal: controller.signal })
      .then(setEvents)
      .catch(() => setDidError(true));

    return function cancel() {
      controller.abort();
    };
  }, []);

  // Exactly one of these three fields should be truthy at all times.
  return {
    isLoading: !events && !didError,
    data: events,
    didError,
  };
}
