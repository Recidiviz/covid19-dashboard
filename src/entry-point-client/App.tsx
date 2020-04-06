import { hot } from "react-hot-loader";
import { Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { GlobalStyles } from "../styles";
import PageList from "./PageList";
import WindowTitle from "./WindowTitle";

const App: React.FC = () => {
  return (
    <>
      <GlobalStyles />
      <ToastContainer />
      <Switch>
        {PageList.map(({ path, title, contents }) => (
          <Route key={path} path={path} exact>
            <WindowTitle>{title}</WindowTitle>
            {contents}
          </Route>
        ))}
      </Switch>
    </>
  );
};

export default hot(module)(App);
