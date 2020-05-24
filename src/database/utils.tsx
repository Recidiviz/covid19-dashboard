import mapObject from "map-obj";

import { EpidemicModelPersistent } from "../components/impact-dashboard/EpidemicModelContext";

const undefinedString = "undefined";

export const prepareForStorage = (state: EpidemicModelPersistent): object => {
  return mapObject(
    state,
    (key, value) => {
      if (value === undefinedString) {
        throw new Error(`The string '${undefinedString}' cannot be persisted`);
      }

      return [key, value === undefined ? undefinedString : value];
    },
    { deep: true },
  );
};

export const prepareFromStorage = (state: object): EpidemicModelPersistent => {
  return mapObject(
    state,
    (key, value) => [key, value === undefinedString ? undefined : value],
    { deep: true },
  );
};
