import createFlags from "flag";
import React from "react";

export type FeatureFlags = {
  useRt: boolean;
  // TODO: Delete this flag once #202 is done
  showRateOfSpreadTab: boolean;
};

const { FlagsProvider, Flag, useFlag, useFlags } = createFlags<FeatureFlags>();

export const FeatureFlagsProvider: React.FC = ({ children }) => {
  return (
    <FlagsProvider
      flags={{
        useRt: process.env.GATSBY_USE_RT === "true",
        showRateOfSpreadTab: true,
      }}
    >
      {children}
    </FlagsProvider>
  );
};

export { Flag, useFlag, useFlags };
