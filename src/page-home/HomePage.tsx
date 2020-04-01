import { Link } from "react-router-dom";

const HomePage: React.FC = () => (
  <div>
    <h1>Home page</h1>
    <p>
      Go to <Link to="/overview">Overview</Link>.
    </p>
    <p>
      Go to <Link to="/test">Test Page</Link>.
    </p>
  </div>
);

export default HomePage;
