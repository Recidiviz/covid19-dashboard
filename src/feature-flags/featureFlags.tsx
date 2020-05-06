import createFlags from "flag";
import React from "react";

export type FeatureFlags = {
  useRt: boolean;
  // TODO: Delete this flag once #202 is done
  showRateOfSpreadTab: boolean;
  showImpactButton: boolean;
};

const { FlagsProvider, Flag, useFlag, useFlags } = createFlags<FeatureFlags>();

export const FeatureFlagsProvider: React.FC = ({ children }) => {
  return (
    <FlagsProvider
      flags={{
        useRt: process.env.GATSBY_USE_RT === "true",
        showRateOfSpreadTab: false,
        showImpactButton: process.env.GATSBY_SHOW_IMPACT_BUTTON === "true",
      }}
    >
      {children}
    </FlagsProvider>
  );
};

export { Flag, useFlag, useFlags };
