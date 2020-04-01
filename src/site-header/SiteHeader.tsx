import { Link } from "react-router-dom";

const SiteHeader: React.FC<{}> = () => (
  <nav className="font-semibold font-display text-sm">
    <div className="flex justify-between h-16 flex-wrap">
      <div className="flex">
        <Link to="/" className="flex uppercase">
          <h3 className="inline-flex items-center px-1 pt-1 leading-5">
            CJ Status •
          </h3>
          <h3 className="inline-flex items-center px-1 pt-1 leading-5 text-red">
            COVID-19
          </h3>
        </Link>
      </div>
      {/* <!-- Nav Items and Social Links --> */}
      <div className="flex items-center justify-between">
        <Link to="/about" className="mr-4 px-1 pt-1 font-medium text-green">
          About
        </Link>
        <Link
          to="/get-involved"
          className="mx-4 px-1 pt-1 font-medium text-green"
        >
          Get Involved
        </Link>
        <div className="mt-1 text-green flex justify-between text-green">
          <a href="#">
            <img
              className="h-4 w-4 mx-1"
              src={require("./icons/ic_twitter.svg")}
            />
          </a>
          <a href="#">
            <img
              className="h-4 w-4 mx-1"
              src={require("./icons/ic_facebook.svg")}
            />
          </a>
          <a href="#">
            <img
              className="h-4 w-4 mx-1"
              src={require("./icons/ic_email.svg")}
            />
          </a>
        </div>
      </div>
      {/* <!-- End Nav Items and Social Links --> */}
    </div>
  </nav>
);

export default SiteHeader;
