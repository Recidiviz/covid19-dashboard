import { Link } from "react-router-dom";
import styled from "styled-components";

import { useAuth0 } from "../auth/react-auth0-spa";
import Colors from "../design-system/Colors";
import Logo from "./Logo";

const LogoContainer = styled.div`
  align-items: flex-end;
  color: ${Colors.red};
  display: flex;
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.05em;
  text-transform: uppercase;
`;

const Subhead = styled.div`
  margin-left: 1em;
`;

const SiteHeader: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, logout } = (useAuth0 as any)();

  const logoutWithRedirect = () => logout({ returnTo: window.location.origin });

  return (
    <nav className="font-semibold font-display text-sm">
      <div className="flex justify-between h-16 flex-wrap items-center">
        <Link to="/">
          <LogoContainer>
            <Logo />
            <Subhead>COVID-19 Incarceration Model</Subhead>
          </LogoContainer>
        </Link>
        {/* <!-- Nav Items and Social Links --> */}
        <div className="flex items-center justify-between">
          <Link
            to="/get-involved"
            className="mx-4 px-1 pt-1 font-medium text-green"
          >
            Get Involved
          </Link>
          <div className="mx-4 px-1 pt-1 font-medium text-green">
            {!isAuthenticated && (
              <button onClick={() => loginWithRedirect({})}>Log In</button>
            )}

            {isAuthenticated && (
              <button onClick={() => logoutWithRedirect()}>Log Out</button>
            )}
          </div>
        </div>
        {/* <!-- End Nav Items and Social Links --> */}
      </div>
    </nav>
  );
};

export default SiteHeader;
