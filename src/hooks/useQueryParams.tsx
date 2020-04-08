import { isEqual } from "lodash";
import queryString from "query-string";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

export interface QueryParams {
  [key: string]: string | number | undefined;
}

export type HistoryAction = "replace" | "push";

// A basic hook for fetching query param values and setting query param values
const useQueryParams = (
  defaultValues: QueryParams,
  defaultAction: HistoryAction = "replace",
): [
  QueryParams,
  Dispatch<SetStateAction<QueryParams>>,
  Dispatch<SetStateAction<HistoryAction>>,
] => {
  const history = useHistory();
  const location = useLocation();

  const defaultQueryParams = queryString.parse(location.search) as QueryParams;
  const hasExistingURLQueryParams = Object.keys(defaultQueryParams).length > 0;

  const initialValues = hasExistingURLQueryParams
    ? defaultQueryParams
    : defaultValues;
  const [values, setValues] = useState<QueryParams>(initialValues);
  const [action, setAction] = useState<HistoryAction>(defaultAction);

  // If values have been updated, also set the query params
  useEffect(() => {
    const currentQuery = queryString.parse(location.search);

    if (!isEqual(currentQuery, values)) {
      location.search = queryString.stringify(values);
      if (action == "replace") {
        history.replace(location);
      }
      if (action == "push") {
        history.push(location);
      }
    }
  }, [values]);

  // If the query params in the url changes, also set the values
  useEffect(() => {
    const nextValues = queryString.parse(location.search) as QueryParams;

    if (!isEqual(values, nextValues)) {
      setValues(nextValues);
    }
  }, [history.location.search]);

  return [values, setValues, setAction];
};

export default useQueryParams;
