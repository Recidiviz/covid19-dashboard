import { scaleOrdinal, schemeDark2 as colorScheme } from "d3";

import { seirIndexList } from "../infection-model/seir";

export const getMarkColor = scaleOrdinal(colorScheme).domain(
  seirIndexList.map((i) => i.toString()),
);
