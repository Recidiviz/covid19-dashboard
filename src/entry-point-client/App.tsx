import React, { useState } from "react";
import { hot } from "react-hot-loader";
import { Route, Switch } from "react-router-dom";

import AuthWall from "../auth/AuthWall";
import { LocaleDataProvider } from "../locale-data-context";
import { FacilityContext } from "../page-multi-facility/FacilityContext";
import { ScenarioProvider } from "../scenario-context";
import { GlobalStyles } from "../styles";
import PageList from "./PageList";
import WindowTitle from "./WindowTitle";

const App: React.FC = () => {
  const [facility, setFacility] = useState();

  return (
    <LocaleDataProvider>
      <ScenarioProvider>
        <FacilityContext.Provider value={{ facility, setFacility }}>
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
        </FacilityContext.Provider>
      </ScenarioProvider>
    </LocaleDataProvider>
  );
};

export default hot(module)(App);
