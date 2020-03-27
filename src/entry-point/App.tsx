import { hot } from "react-hot-loader";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import HomePage from "../page-home/HomePage";
import TestPage from "../page-test/TestPage";

const App: React.FC<{}> = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/test">
          <TestPage />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default hot(module)(App);
