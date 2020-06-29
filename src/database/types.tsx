import * as firebase from "firebase/app";
import { Overwrite } from "utility-types";

import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";
import { PersistedFacility } from "../page-multi-facility/types";

type ServerDate = Date | firebase.firestore.FieldValue;

export type ModelInputsUpdate = Overwrite<
  EpidemicModelPersistent,
  {
    observedAt: Date;
    updatedAt?: ServerDate;
  }
>;

export type FacilityDocUpdate = Overwrite<
  Partial<PersistedFacility>,
  {
    createdAt?: ServerDate;
    updatedAt?: ServerDate;
    modelInputs?: ModelInputsUpdate;
  }
>;
