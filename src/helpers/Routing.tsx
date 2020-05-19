import { Routes } from "../constants/Routes";

/**
 * Replace the url params in a url template.
 *
 * For example, take /scenario/:scenarioId and replace the :scenarioId with a $id.
 * @param urlTemplate String containing the params
 * @param params Object containing params to replace in the template
 */
export const ReplaceUrlParams = (
  urlTemplate: string,
  params: { [key: string]: string },
) => {
  const urlFragments = urlTemplate.split("/");

  for (let i = 0; i < urlFragments.length; i++) {
    const urlParam = urlFragments[i]; // Starts with :, ie. :scenarioId

    if (!!params[urlParam.substring(1)]) {
      urlFragments[i] = params[urlParam.substring(1)];
    }
  }

  return urlFragments.join("/");
};

type RouteParamValues = {
  scenarioId?: string;
  facilityId?: string;
};

/**
 * Take a url from props.location and return the url param.
 *
 * For example, take /scenario/id123 and return the :scenarioId which is 'id123'.
 * @param pathname Url pathname from props.location
 * @param param Url template param to return
 */
export const RouteParam = (
  pathname: string,
  param: string,
): RouteParamValues => {
  let result = {};
  const urlFragments = pathname.split("/");

  switch (param) {
    case Routes.Scenario.name:
      if (urlFragments.length <= 3) {
        result = {
          scenarioId: urlFragments[2],
        };
      }
      break;

    case Routes.Facility.name:
      if (urlFragments.length <= 5) {
        result = {
          scenarioId: urlFragments[2],
          facilityId: urlFragments[4],
        };
      }
      break;
    default:
  }

  return result;
};
