import { hot } from "react-hot-loader";
import { Route, Switch } from "react-router-dom";

import FormPage from "../page-form/FormPage";
import HomePage from "../page-home/HomePage";
import TestPage from "../page-test/TestPage";
import { GlobalStyles } from "../styles";
import WindowTitle from "./WindowTitle";

const App: React.FC<{}> = () => {
  return (
    <>
      <GlobalStyles />
      <Switch>
        <Route path="/test">
          <WindowTitle>Test Page</WindowTitle>
          <TestPage />
        </Route>
        <Route path="/contribute">
          <FormPage />
        </Route>
        <Route path="/">
          <WindowTitle>Recidiviz COVID-19 Dashboard</WindowTitle>
          <HomePage />
        </Route>
      </Switch>
    </>
  );
};

export default hot(module)(App);
