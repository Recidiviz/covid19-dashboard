import { hot } from "react-hot-loader";
import { Redirect, Route, Switch } from "react-router-dom";

import PrivateRoute from "../auth/PrivateRoute";
import { useAuth0 } from "../auth/react-auth0-spa";
import Loading from "../design-system/Loading";
import VerificationNeeded from "../page-verification-needed/VerificationNeeded";
import { GlobalStyles } from "../styles";
import PageList from "./PageList";
import WindowTitle from "./WindowTitle";

const App: React.FC = () => {
  const { loading, user } = (useAuth0 as any)();

  if (loading) {
    return <Loading />;
  }

  const redirectIfUnverified = (userObject: any, contents: any) => {
    if (userObject && !userObject.email_verified) {
      return <Redirect to="/verify" />;
    }
    return contents;
  };

  return (
    <>
      <GlobalStyles />
      <Switch>
        <Route path="/verify">
          <WindowTitle>Verification Needed</WindowTitle>
          <VerificationNeeded />
        </Route>

        {PageList.map(({ path, title, isPrivate, contents }) => {
          if (!isPrivate) {
            return (
              <Route key={path} path={path} exact>
                <WindowTitle>{title}</WindowTitle>
                {redirectIfUnverified(user, contents)}
              </Route>
            );
          } else {
            return (
              <PrivateRoute key={path} path={path} exact>
                <WindowTitle>{title}</WindowTitle>
                {redirectIfUnverified(user, contents)}
              </PrivateRoute>
            );
          }
        })}
      </Switch>
    </>
  );
};

export default hot(module)(App);
