import { css } from "@emotion/core";
import BounceLoader from "react-spinners/BounceLoader";

import { GlobalStyles } from "../styles";

const override = css`
  display: block;
  margin: 0 auto;
  position: fixed;
  top: 50%;
  left: 50%;
  -ms-transform: translateX(-50%) translateY(-50%);
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;

const Loading: React.FC = () => {
  return (
    <>
      <GlobalStyles />
      <BounceLoader css={override} size={60} color={"#005450"} />
    </>
  );
};

export default Loading;
