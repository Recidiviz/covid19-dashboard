import BounceLoader from "react-spinners/BounceLoader";

import { GlobalStyles } from "../styles";

const override = {
  display: "block",
  margin: "0 auto",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};

const Loading: React.FC = () => {
  return (
    <>
      <GlobalStyles />
      <div>
        {/* BounceLoader's type definition might be wrong. */}
        <BounceLoader css={override as any} size={60} color={"#005450"} />
      </div>
    </>
  );
};

export default Loading;
