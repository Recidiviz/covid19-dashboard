import createFlags from "flag";
import React from "react";

export type FeatureFlags = {
  useRt: boolean;
};

const { FlagsProvider, Flag, useFlag, useFlags } = createFlags<FeatureFlags>();

export const FeatureFlagsProvider: React.FC = ({ children }) => {
  return (
    <FlagsProvider
      flags={{
        useRt: process.env.GATSBY_USE_RT === "true",
      }}
    >
      {children}
    </FlagsProvider>
  );
};

export { Flag, useFlag, useFlags };
