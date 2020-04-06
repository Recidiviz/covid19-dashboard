import { hot } from "react-hot-loader";
import { Redirect, Route, Switch } from "react-router-dom";

import { GlobalStyles } from "../styles";
import PageList from "./PageList";
import WindowTitle from "./WindowTitle";
import PrivateRoute from "../private-route/PrivateRoute";
import Loading from "../loading-spinner/Loading";
import VerificationNeeded from "../verification-needed/VerificationNeeded";

import { useAuth0 } from "../react-auth0-spa";

const App: React.FC = () => {
  const { loading, user } = useAuth0();

  if (loading) {
    return <Loading />;
  }

  const redirectIfUnverified = (userObject, contents) => {
    if (userObject && !userObject.email_verified) {
      return <Redirect to="/verify" />
    }
    return contents;
  }

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
            }

            if (isPrivate) {
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
