/* eslint-disable filenames/match-exported */
import { Redirect } from "react-router-dom";
import React from "react";
import {scenarioRootUrl} from '../constants/Routes'

// eslint-disable-next-line react/display-name
export default () => <Redirect to={scenarioRootUrl} />;
