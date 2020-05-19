/* eslint-disable filenames/match-exported */
import React from "react";

import AuthWall from "../../auth/AuthWall";
import SiteHeader from "../../site-header/SiteHeader";

// eslint-disable-next-line react/display-name
export default (props: { children: any }) => (
  <AuthWall>
    <div className="font-body text-green min-h-screen tracking-normal w-full">
      <div className="max-w-screen-xl px-4 mx-auto">
        <SiteHeader />
        {props.children}
      </div>
    </div>
  </AuthWall>
);
