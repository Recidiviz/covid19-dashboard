import { Link } from "gatsby";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";

import { useAuth0 } from "../auth/react-auth0-spa";
import {Routes} from '../constants/Routes';
import Colors from "../design-system/Colors";
import Logo from "./Logo";

const Nav = styled.nav`
  align-items: center;
  border-bottom: 1px solid ${Colors.opacityGray};
  display: flex;
  flex-wrap: wrap;
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  font-weight: 600;
  height: 130px;
  justify-content: space-between;
`;

const SiteHeader: React.FC<{isApp?: boolean}> = ({isApp: isApp}) => {
  const { isAuthenticated, loginWithRedirect, logout } = (useAuth0 as any)();

  const logoutWithRedirect = () => logout({ returnTo: window.location.origin });

  return (
    <Nav>
      {
        (isApp ? (
          <RouterLink to={Routes.App.url}>
            <Logo />
          </RouterLink>
        ) : (
          <Link to={Routes.App.url}>
            <Logo />
          </Link>
        ))
      }
      {/* <!-- Nav Items and Social Links --> */}
      <div className="flex items-center justify-between">
        <Link to={Routes.About.url} className="mx-4 px-1 pt-1 font-medium text-green">
          About
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
    </Nav>
  );
};

export default SiteHeader;
