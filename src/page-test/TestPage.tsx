import { Link } from "gatsby";
import React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import useQueryParams, { QueryParams } from "../hooks/useQueryParams";
import ImpactDashboard from "../impact-dashboard";
import NewsFeed from "../news-feed-events/NewsFeed";
import {
  FakeNewsFeedEvents,
  useFetchedNewsFeedEvents,
} from "../news-feed-events/NewsFeedEvent";

// Tests that async/await keywords are supported.
async function delay(timeout: number) {
  return await new Promise((resolve) => setTimeout(resolve, timeout));
}

// Tests that styled components works.
const Title = styled.h1`
  font-size: 1.5em;
  color: palevioletred;
`;

const TestPage: React.FC = () => {
  // Tests that hooks are supported.
  const [greetingReady, setGreetingReady] = useState<boolean>(false);
  const { values, replaceValues, pushValues } = useQueryParams({
    val1: 1,
    val2: 2,
  });

  useEffect(() => {
    async function effect() {
      await delay(1000);
      setGreetingReady(true);
    }
    effect();
  });

  let fetchedNewsFeedEvents = useFetchedNewsFeedEvents();
  let fetchedNewsFeed;
  if (fetchedNewsFeedEvents.data) {
    fetchedNewsFeed = <NewsFeed events={fetchedNewsFeedEvents.data} />;
  } else if (fetchedNewsFeedEvents.didError) {
    fetchedNewsFeed = <>(An error occurred while fetching)</>;
  } else {
    fetchedNewsFeed = <>Loading...</>;
  }

  return (
    <div>
      <h2>Test of impact dashboard</h2>
      <div>
        <ImpactDashboard />
      </div>
      <h2>Test of news feed with fake data:</h2>
      <NewsFeed events={FakeNewsFeedEvents} />
      <h2>Test of news feed with data pulled from spreadsheet:</h2>

      {fetchedNewsFeed}
      <p>
        You can type in this textarea and make edits in src/test/TestPage.tsx
        and save, and your textarea text should be preserved. This tests React
        hot loading.
      </p>
      <textarea defaultValue="edit me! then edit TestPage.tsx!" />
      <Title>Test page</Title>
      <p>
        {greetingReady ? (
          <>
            Hello! I have appeared after a 1s delay. Refresh the page to see me
            do that again!
          </>
        ) : (
          <br />
        )}
      </p>
      <p>
        Go to <Link to="/">Home Page</Link>.
      </p>
      <div>
        <h1> h1 </h1>
        <p> paragraph </p>
        <div> div </div>
        <div className="description"> description </div>
        <div className="nav-link">nav-link</div>
        <div className="metric">metric</div>
        <div className="tooltip">tooltip</div>
        <div className="ic-facts">ic-facts</div>
        <div className="ic-share">ic-share</div>
      </div>

      <div>
        <button
          onClick={() =>
            replaceValues({ ...values, val1: (values.val1 as number) + 1 })
          }
        >
          (REPLACE) Val1: {values.val1}
        </button>
        <button
          onClick={() =>
            pushValues({ ...values, val2: (values.val2 as number) + 1 })
          }
        >
          (PUSH) Val2: {values.val2}
        </button>
      </div>
    </div>
  );
};

export default TestPage;
