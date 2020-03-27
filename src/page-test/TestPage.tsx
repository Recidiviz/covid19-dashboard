import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// Tests that async/await keywords are supported.
async function delay(timeout: number) {
  return await new Promise((resolve) => setTimeout(resolve, timeout));
}

// Tests that styled components works.
const Title = styled.h1`
  font-size: 1.5em;
  color: palevioletred;
`;

const TestPage: React.FC<{}> = () => {
  // Tests that hooks are supported.
  const [greetingReady, setGreetingReady] = useState<boolean>(false);
  useEffect(() => {
    async function effect() {
      await delay(1000);
      setGreetingReady(true);
    }
    effect();
  });

  return (
    <div>
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
    </div>
  );
};

export default TestPage;
