import createFlags from "flag";
import React from "react";

export type FeatureFlags = {
  // TODO: Delete this flag once #202 is done
  showRateOfSpreadTab: boolean;
  showImpactButton: boolean;
  // TODO: can remove after successful launch
  enableShadowData: boolean;
};

const { FlagsProvider, Flag, useFlag, useFlags } = createFlags<FeatureFlags>();

export const FeatureFlagsProvider: React.FC = ({ children }) => {
  return (
    <FlagsProvider
      flags={{
        showRateOfSpreadTab: true,
        showImpactButton: process.env.GATSBY_SHOW_IMPACT_BUTTON === "true",
        enableShadowData: process.env.GATSBY_ENABLE_SHADOW_DATA === "true",
      }}
    >
      {children}
    </FlagsProvider>
  );
};

export { Flag, useFlag, useFlags };
