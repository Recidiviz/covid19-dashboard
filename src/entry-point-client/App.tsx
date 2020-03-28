import { hot } from "react-hot-loader";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import FormPage from "../page-form/FormPage";
import HomePage from "../page-home/HomePage";
import TestPage from "../page-test/TestPage";
import { GlobalStyles } from "../styles";

const App: React.FC<{}> = () => {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <Switch>
        <Route path="/test">
          <TestPage />
        </Route>
        <Route path="/contribute">
          <FormPage />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default hot(module)(App);
