import { isEqual as isGenerallyEqual } from "lodash";
import qs from "qs";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

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

// A basic hook for fetching query param values and setting query param values
// Optionally pass in an array of valid keys if you want to be strict about your set of query parameters
const useQueryParams = (
  defaultValues: QueryParams,
  validKeys?: string[],
): UseQueryParamsOutput => {
  const history = useHistory();

  const defaultQueryParams = qs.parse(history.location.search) as QueryParams;
  const hasExistingURLQueryParams = Object.keys(defaultQueryParams).length > 0;

  const initialValues = hasExistingURLQueryParams
    ? defaultQueryParams
    : defaultValues;
  const [values, setValues] = useState<QueryParams>(initialValues);
  const [action, setAction] = useState<HistoryAction>("replace");

  // If values have been updated, also set the query params
  useEffect(() => {
    const currentQuery = qs.parse(history.location.search) as QueryParams;

    if (!isEqual(currentQuery, values, validKeys)) {
      const newLocation = {
        ...history.location,
        search: qs.stringify(values),
      };
      if (action == "replace") {
        history.replace(newLocation);
      }
      if (action == "push") {
        history.push(newLocation);
      }
    }
  }, [values]);

  // If the query params in the url changes, also set the values
  useEffect(() => {
    const nextValues = qs.parse(location.search) as QueryParams;

    if (!isEqual(values, nextValues, validKeys)) {
      setValues(nextValues);
    }
  }, [history.location.search]);

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
