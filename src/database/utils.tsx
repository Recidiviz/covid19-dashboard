import { mapValues } from "lodash";

import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";

const undefinedString = "undefined";

export const prepareForStorage = (state: EpidemicModelPersistent): object => {
  return mapValues(state, (value) => {
    if (value === undefinedString) {
      throw new Error(`The string '${undefinedString}' cannot be persisted`);
    }

    return value === undefined ? undefinedString : value;
  });
};

export const prepareFromStorage = (state: object): EpidemicModelPersistent => {
  return mapValues(state, (value) =>
    value === undefinedString ? undefined : value,
  );
};
