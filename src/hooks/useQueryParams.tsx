import { useLocation } from "@reach/router";
import { navigate } from "gatsby";
import { isEqual as isGenerallyEqual } from "lodash";
import qs from "qs";
import { useEffect, useState } from "react";

import { EpidemicModelPersistent } from "../components/impact-dashboard/EpidemicModelContext";
import { prepareForStorage, prepareFromStorage } from "../database/utils";

export interface QueryParams {
  [key: string]: any;
}

export type HistoryAction = "replace" | "push";

interface UseQueryParamsOutput {
  values: QueryParams;
  pushValues: (newValues: QueryParams) => void;
  replaceValues: (newValues: QueryParams) => void;
}

// Just supports depth of 1 right now - if we need to check nested query params, please update this function.
function isEqual(
  currentValues: QueryParams,
  nextValues: QueryParams,
  validKeys?: string[],
) {
  if (!validKeys) {
    return isGenerallyEqual(currentValues, nextValues);
  }
  return validKeys.every((key) => {
    return currentValues[key] === nextValues[key];
  });
}

const stringify = (values: EpidemicModelPersistent): string =>
  qs.stringify(prepareForStorage(values));

const parse = (searchString: string): EpidemicModelPersistent =>
  prepareFromStorage(qs.parse(searchString));

// A basic hook for fetching query param values and setting query param values
// Optionally pass in an array of valid keys if you want to be strict about your set of query parameters
const useQueryParams = (
  defaultValues: QueryParams,
  validKeys?: string[],
): UseQueryParamsOutput => {
  const location = useLocation();

  const defaultQueryParams = parse(location.search) as QueryParams;
  const hasExistingURLQueryParams = Object.keys(defaultQueryParams).length > 0;

  const initialValues = hasExistingURLQueryParams
    ? defaultQueryParams
    : defaultValues;
  const [values, setValues] = useState<QueryParams>(initialValues);
  const [action, setAction] = useState<HistoryAction>("replace");

  // If values have been updated, also set the query params
  useEffect(() => {
    const currentQuery = parse(location.search) as QueryParams;

    if (!isEqual(currentQuery, values, validKeys)) {
      const newLocation = new URL("?" + stringify(values), location.href).href;

      if (action == "replace") {
        navigate(newLocation, { replace: true });
      }
      if (action == "push") {
        navigate(newLocation);
      }
    }
  }, [values]);

  // If the query params in the url changes, also set the values
  useEffect(() => {
    const nextValues = parse(location.search) as QueryParams;

    if (!isEqual(values, nextValues, validKeys)) {
      setValues(nextValues);
    }
  }, [location.search]);

  // replaceValues will replace the current entry on history
  const replaceValues = (newValues: QueryParams) => {
    setAction("replace");
    setValues(newValues);
  };

  // pushValues will push another url entry onto history
  const pushValues = (newValues: QueryParams) => {
    setAction("push");
    setValues(newValues);
  };

  return {
    values,
    replaceValues,
    pushValues,
  };
};

export default useQueryParams;
