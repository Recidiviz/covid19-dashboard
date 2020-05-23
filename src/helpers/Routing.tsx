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
