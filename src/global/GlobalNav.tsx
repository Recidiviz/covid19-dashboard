import imgEmail from "./assets/ic_email.svg";
import imgFacebook from "./assets/ic_facebook.svg";
import imgTwitter from "./assets/ic_twitter.svg";

const Header: React.FC<{}> = () => (
  <nav className="container mx-auto font-semibold font-display text-sm">
    {/* <!-- Smaller Header --> */}
    <div className="sm:hidden">
      <div className="flex justify-center">
        <div className="mt-10 uppercase">
          <h3 className="inline-flex items-center leading-5">CJ Status •</h3>
          <h3 className="inline-flex items-center leading-5 text-red">
            COVID-19
          </h3>
        </div>
      </div>
    </div>
    {/* <!-- End Smaller Header --> */}
    {/* <!-- Larger Header --> */}
    <div className="hidden sm:block">
      <div className="mx-auto">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="sm:flex uppercase">
              <h3 className="inline-flex items-center px-1 pt-1 leading-5">
                CJ Status •
              </h3>
              <h3 className="inline-flex items-center px-1 pt-1 leading-5 text-red">
                COVID-19
              </h3>
            </div>
          </div>
          {/* <!-- Nav Items and Social Links --> */}
          <div className="sm:ml-6 sm:flex sm:items-center">
            <a href="#" className="mx-4 px-1 pt-1 font-medium text-green-700">
              About
            </a>
            <a href="#" className="mx-4 px-1 pt-1 font-medium text-green-700">
              Get Involved
            </a>
            <div className="mt-1 text-green-700 flex justify-between text-green-900">
              <a href="#">
                <img className="h-4 w-4 mx-1" src={imgTwitter} />
              </a>
              <a href="#">
                <img className="h-4 w-4 mx-1" src={imgFacebook} />
              </a>
              <a href="#">
                <img className="h-4 w-4 mx-1" src={imgEmail} />
              </a>
            </div>
          </div>
          {/* <!-- End Nav Items and Social Links --> */}
        </div>
      </div>
    </div>
    {/* <!-- End Larger Header --> */}
  </nav>
);

const Footer: React.FC<{}> = () => (
  <footer className="sm:hidden font-semibold">
    {/* <!-- Footer only shown on smaller screens --> */}
    <div className="m-4 sm:m-8 flex justify-around">
      <a href="#">About</a>
      <a href="#">Get Involved</a>
      <div className="flex">
        <a href="#">
          <img className="h-5 w-5 mx-2" src={imgTwitter} />
        </a>
        <a href="#">
          <img className="h-5 w-5 mx-2" src={imgFacebook} />
        </a>
        <a href="#">
          <img className="h-5 w-5 mx-2" src={imgEmail} />
        </a>
      </div>
    </div>
  </footer>
);

const GlobalNav = { Header, Footer };

export default GlobalNav;
