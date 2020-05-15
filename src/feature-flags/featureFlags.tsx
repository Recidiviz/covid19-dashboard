import createFlags from "flag";
import React from "react";

export type FeatureFlags = {
  // TODO: Delete this flag once #202 is done
  showRateOfSpreadTab: boolean;
  showImpactButton: boolean;
  // TODO: can remove after #169 is successfully released to prod
  enableSharing: boolean;
};

const { FlagsProvider, Flag, useFlag, useFlags } = createFlags<FeatureFlags>();

export const FeatureFlagsProvider: React.FC = ({ children }) => {
  return (
    <FlagsProvider
      flags={{
        showRateOfSpreadTab: true,
        showImpactButton: process.env.GATSBY_SHOW_IMPACT_BUTTON === "true",
        enableSharing: process.env.GATSBY_ENABLE_SHARING === "true",
      }}
    >
      {children}
    </FlagsProvider>
  );
};

export { Flag, useFlag, useFlags };
