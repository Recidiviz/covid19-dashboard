import { hot } from "react-hot-loader";
import { Route, Switch } from "react-router-dom";

import AuthWall from "../auth/AuthWall";
import { LocaleDataProvider } from "../locale-data-context";
import { GlobalStyles } from "../styles";
import PageList from "./PageList";
import WindowTitle from "./WindowTitle";

const App: React.FC = () => {
  return (
    <LocaleDataProvider>
      <GlobalStyles />
      <Switch>
        {PageList.map(({ path, title, isPrivate, contents }) => {
          if (!isPrivate) {
            return (
              <Route key={path} path={path} exact>
                <WindowTitle>{title}</WindowTitle>
                {contents}
              </Route>
            );
          } else {
            return (
              <Route key={path} path={path} exact>
                <AuthWall>
                  <WindowTitle>{title}</WindowTitle>
                  {contents}
                </AuthWall>
              </Route>
            );
          }
        })}
      </Switch>
    </LocaleDataProvider>
  );
};

export default hot(module)(App);
