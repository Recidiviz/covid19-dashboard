import { isAfter } from "date-fns";
import { navigate } from "gatsby";
import { size } from "lodash";
import React, { useCallback, useEffect, useReducer } from "react";

import { referenceFacilitiesProp, saveScenario } from "../../../database";
import { useFacilities } from "../../../facilities-context";
import useIsOwnScenario from "../../../hooks/useIsOwnScenario";
import useRejectionToast from "../../../hooks/useRejectionToast";
import useScenario from "../../../scenario-context/useScenario";
import { Scenario } from "../../types";
import { getUnmappedReferenceFacilities } from "../shared";
import SyncNewFacility from "../SyncNewFacility";
import SyncNewReferenceData from "../SyncNewReferenceData";
import SyncNoUserFacilities from "../SyncNoUserFacilities";
import { referenceDataModalReducer } from "./reducers";

export interface ReferenceDataModalState {
  canSyncNewFacility?: boolean;
  newFacilityIdToSync?: string;
  renderSyncButton: boolean;
  showSyncNewReferenceData: boolean;
  useExistingFacilities: boolean;
}

export type ReferenceDataModalAction = {
  type: "UPDATE";
  payload: Partial<ReferenceDataModalState>;
};
type ReferenceDataModalDispatch = (action: ReferenceDataModalAction) => void;

interface ReferenceDataModalContext {
  state: ReferenceDataModalState;
  dispatch: ReferenceDataModalDispatch;
}

const ReferenceDataModalContext = React.createContext<
  ReferenceDataModalContext | undefined
>(undefined);

type SyncType = "single" | "all";

export const ReferenceDataModalProvider: React.FC<{ syncType: SyncType }> = ({
  children,
  syncType,
}) => {
  const [state, dispatch] = useReducer(referenceDataModalReducer, {
    renderSyncButton: false,
    showSyncNewReferenceData: false,
    useExistingFacilities: true,
  });
  const [{ data: scenario }, dispatchScenarioUpdate] = useScenario();
  const {
    state: facilitiesState,
    actions: { deselectFacility },
  } = useFacilities();

  const featureAvailable = facilitiesState.referenceDataFeatureAvailable;

  const featureActive = scenario?.useReferenceData;

  const isOwnScenario = useIsOwnScenario(scenario);

  const haveReferenceFacilities = Boolean(
    size(facilitiesState.referenceFacilities),
  );

  const haveFacilities = Boolean(size(facilitiesState.facilities));

  const haveUnmappedReferenceFacilities =
    scenario &&
    haveReferenceFacilities &&
    Boolean(
      getUnmappedReferenceFacilities(
        scenario[referenceFacilitiesProp],
        facilitiesState.referenceFacilities,
      ).length,
    );

  const renderSyncNoUserFacilities =
    featureAvailable &&
    featureActive &&
    isOwnScenario &&
    syncType === "all" &&
    !facilitiesState.loading &&
    !haveFacilities;

  const renderSyncModal =
    featureAvailable &&
    isOwnScenario &&
    haveFacilities &&
    haveReferenceFacilities;

  const showSyncNewReferenceDataBase = renderSyncModal && syncType === "all";

  const rejectionToast = useRejectionToast();

  const handleScenarioChange = useCallback(
    (scenarioChange: any) => {
      const changes = Object.assign({}, scenario, scenarioChange);
      rejectionToast(
        saveScenario(changes).then(() => dispatchScenarioUpdate(changes)),
      );
    },
    [dispatchScenarioUpdate, rejectionToast, scenario],
  );

  const clearPromoStatus = useCallback(() => {
    const scenarioChange: Partial<Scenario> = {
      referenceDataObservedAt: new Date(),
    };
    // only want to show this once as a promo;
    // closing the modal should dismiss the promo status
    if (scenario?.promoStatuses.referenceData) {
      scenarioChange.promoStatuses = {
        ...scenario.promoStatuses,
        referenceData: false,
      };
    }
    handleScenarioChange(scenarioChange);
  }, [handleScenarioChange, scenario]);

  // if we can render the sync modal, consumers can render the button to open it
  useEffect(() => {
    dispatch({
      type: "UPDATE",
      payload: { renderSyncButton: Boolean(renderSyncModal) },
    });
  }, [renderSyncModal]);

  // open sync modal automatically based on promo status
  useEffect(() => {
    if (
      showSyncNewReferenceDataBase &&
      haveUnmappedReferenceFacilities &&
      scenario?.promoStatuses.referenceData
    ) {
      dispatch({
        type: "UPDATE",
        payload: {
          showSyncNewReferenceData: true,
          useExistingFacilities: true,
        },
      });
    }
  }, [
    facilitiesState.referenceFacilities,
    haveUnmappedReferenceFacilities,
    scenario,
    showSyncNewReferenceDataBase,
  ]);

  // open sync modal automatically when new reference facilities are detected
  // (include new facilities only, not the full list)
  useEffect(() => {
    if (
      showSyncNewReferenceDataBase &&
      haveUnmappedReferenceFacilities &&
      // this only applies if the promo status has been dismissed
      !scenario?.promoStatuses.referenceData &&
      // if we either don't have a last seen date, or we have facilities newer than that date,
      // then we want to show this alternate modal
      (!scenario?.referenceDataObservedAt ||
        Object.values(facilitiesState.referenceFacilities).some(
          (refFacility) => {
            return (
              scenario?.referenceDataObservedAt &&
              isAfter(refFacility.createdAt, scenario.referenceDataObservedAt)
            );
          },
        ))
    ) {
      dispatch({
        type: "UPDATE",
        payload: {
          showSyncNewReferenceData: true,
          useExistingFacilities: false,
        },
      });
    }
  }, [
    facilitiesState.referenceFacilities,
    haveUnmappedReferenceFacilities,
    scenario,
    showSyncNewReferenceDataBase,
  ]);

  const canSyncNewFacility = Boolean(
    renderSyncModal && syncType === "single" && haveUnmappedReferenceFacilities,
  );

  useEffect(() => {
    dispatch({ type: "UPDATE", payload: { canSyncNewFacility } });
  }, [canSyncNewFacility]);

  // clear promo status immediately for new scenarios
  // to suppress the promo dialog after the no facilities dialog
  useEffect(() => {
    if (renderSyncNoUserFacilities) {
      clearPromoStatus();
    }
  }, [clearPromoStatus, renderSyncNoUserFacilities]);

  const firstFacility = Object.values(facilitiesState.facilities)[0];
  let stateName;
  let systemType;
  if (firstFacility) {
    systemType = firstFacility.systemType;
    stateName = firstFacility.modelInputs.stateName;
  }

  const closeSyncNewReferenceData = () =>
    dispatch({ type: "UPDATE", payload: { showSyncNewReferenceData: false } });

  return (
    <ReferenceDataModalContext.Provider value={{ state, dispatch }}>
      {children}
      {renderSyncNoUserFacilities && <SyncNoUserFacilities />}
      {renderSyncModal && syncType === "all" && (
        <SyncNewReferenceData
          open={state.showSyncNewReferenceData}
          closeModal={closeSyncNewReferenceData}
          stateName={stateName}
          systemType={systemType}
          onClose={() => {
            dispatch({
              type: "UPDATE",
              payload: {
                showSyncNewReferenceData: false,
                useExistingFacilities: true,
              },
            });

            clearPromoStatus;
          }}
          useExistingFacilities={state.useExistingFacilities}
        />
      )}
      {canSyncNewFacility && (
        <SyncNewFacility
          facilityId={state.newFacilityIdToSync}
          onClose={() => {
            handleScenarioChange({ referenceDataObservedAt: new Date() });
            deselectFacility();
            navigate("/");
          }}
        />
      )}
    </ReferenceDataModalContext.Provider>
  );
};

export function useReferenceDataModal() {
  const context = React.useContext(ReferenceDataModalContext);

  if (context === undefined) {
    throw new Error(
      "useReferenceDataModal must be used within a ReferenceDataModalProvider",
    );
  }

  return context;
}
