import { Link } from "react-router-dom";

import { useAuth0 } from "../auth/react-auth0-spa";

const SiteHeader: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, logout } = (useAuth0 as any)();

  const logoutWithRedirect = () => logout({ returnTo: window.location.origin });

  return (
    <nav className="font-semibold font-display text-sm">
      <div className="flex justify-between h-16 flex-wrap">
        <div className="flex">
          <Link to="/" className="flex uppercase">
            <h3 className="inline-flex items-center px-1 pt-1 leading-5">
              CJ Status •
            </h3>
            <h3 className="inline-flex items-center px-1 pt-1 leading-5 text-red">
              COVID-19 Incarceration Model
            </h3>
          </Link>
        </div>
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
