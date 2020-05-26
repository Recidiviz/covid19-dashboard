import { navigate } from "gatsby";

import { Routes } from "../constants/Routes";

// eslint-disable-next-line react/display-name
export default () => {
  navigate(Routes.App.url, { replace: true });
  return null;
};
