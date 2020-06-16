import mapObject from "map-obj";

import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";

const undefinedString = "undefined";

export const prepareForStorage = (
  stateName: EpidemicModelPersistent,
): object => {
  return mapObject(
    stateName,
    (key, value) => {
      if (value === undefinedString) {
        throw new Error(`The string '${undefinedString}' cannot be persisted`);
      }

      return [key, value === undefined ? undefinedString : value];
    },
    { deep: true },
  );
};

export const prepareFromStorage = (
  stateName: object,
): EpidemicModelPersistent => {
  return mapObject(
    stateName,
    (key, value) => [key, value === undefinedString ? undefined : value],
    { deep: true },
  );
};
