import { format } from "date-fns";
import React from "react";

import { MMMD, MMMMdyyyy } from "../constants";

interface Props {
  date: Date;
  children?: undefined;
}

export const DateMMMD: React.FC<Props> = (props) => {
  return <>{format(props.date, MMMD)}</>;
};

export const DateMMMMdyyyy: React.FC<Props> = (props) => {
  return <>{format(props.date, MMMMdyyyy)}</>;
};
