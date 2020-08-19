jest.mock("../../scenario-context/useScenario");
jest.mock("../../database/index");
jest.mock("../../feature-flags");

import { renderHook } from "@testing-library/react-hooks";
import JestMockPromise from "jest-mock-promise";
import { cloneDeep, isEmpty, noop } from "lodash";
import React from "react";
import { mocked } from "ts-jest/utils";

import {
  compositeFacility,
  referenceFacility,
  userFacility,
} from "../__fixtures__";
import {
  getFacilities,
  getReferenceFacilities,
  referenceFacilitiesProp,
} from "../../database/index";
import { useFlag } from "../../feature-flags";
import { Scenario } from "../../page-multi-facility/types";
import useScenario from "../../scenario-context/useScenario";
import { FacilitiesProvider, useFacilities } from "../FacilitiesContext";

const mockedUseScenario = mocked(useScenario);
const mockedUseFlag = mocked(useFlag);
const mockedGetReferenceFacilities = mocked(getReferenceFacilities);
const mockedGetFacilities = mocked(getFacilities);

function getTestHook() {
  // setup unit under test
  const wrapper: React.FC = ({ children }) => (
    <FacilitiesProvider>{children}</FacilitiesProvider>
  );
  return renderHook(() => useFacilities(), { wrapper });
}

describe("FacilitiesContext", () => {
  let mockBaselineScenario: Scenario;
  beforeEach(() => {
    // setup mocks
    mockedUseFlag.mockReturnValue(true);
    mockedUseScenario.mockReturnValue([
      {
        loading: true,
        failed: false,
        data: null,
      },
      noop,
    ]);

    mockBaselineScenario = {
      name: "Mock Baseline",
      baseline: true,
      id: "mock-baseline-id",
      [referenceFacilitiesProp]: { [userFacility.id]: referenceFacility.id },
      useReferenceData: true,
    } as Scenario; // we are missing some fields but they should not be relevant here
  });

  it("updates reference facilities when the scenario changes", async () => {
    const { result, rerender, waitForNextUpdate } = getTestHook();
    expect(result.current.state.referenceFacilities).toEqual({});

    mockedUseScenario.mockReturnValue([
      {
        loading: false,
        failed: false,
        data: mockBaselineScenario,
      },
      noop,
    ]);
    mockedGetFacilities.mockResolvedValue([cloneDeep(userFacility)]);
    mockedGetReferenceFacilities.mockResolvedValue([
      cloneDeep(referenceFacility),
    ]);

    rerender();

    await waitForNextUpdate();

    expect(result.current.state.referenceFacilities).toEqual({
      [referenceFacility.id]: referenceFacility,
    });
  });

  it("does not use reference data when feature is toggled off", async () => {
    const { result, rerender, wait } = getTestHook();
    expect(result.current.state.facilities).toEqual({});

    mockedUseScenario.mockReturnValue([
      {
        loading: false,
        failed: false,
        data: { ...mockBaselineScenario, useReferenceData: false },
      },
      noop,
    ]);

    mockedGetFacilities.mockResolvedValue([cloneDeep(userFacility)]);

    mockedGetReferenceFacilities.mockResolvedValue([
      cloneDeep(referenceFacility),
    ]);

    rerender();

    await wait(() => !isEmpty(result.current.state.facilities));

    expect(result.current.state.facilities).toEqual({
      [userFacility.id]: userFacility,
    });
  });

  it("does not use reference data when facilities are from multiple systems", async () => {
    const { result, rerender, wait } = getTestHook();
    expect(result.current.state.facilities).toEqual({});

    mockedUseScenario.mockReturnValue([
      {
        loading: false,
        failed: false,
        data: { ...mockBaselineScenario },
      },
      noop,
    ]);

    const secondFacility = cloneDeep(userFacility);
    secondFacility.systemType = "County Jail";
    secondFacility.id = "secondTestFacilityId";
    mockedGetFacilities.mockResolvedValue([
      cloneDeep(userFacility),
      secondFacility,
    ]);

    mockedGetReferenceFacilities.mockResolvedValue([
      cloneDeep(referenceFacility),
    ]);

    rerender();

    await wait(() => !isEmpty(result.current.state.facilities));

    expect(result.current.state.facilities).toEqual({
      [userFacility.id]: userFacility,
      [secondFacility.id]: secondFacility,
    });
  });

  it("waits for reference facilities to load before updating facilities", async () => {
    const { result, rerender, waitForValueToChange } = getTestHook();
    expect(result.current.state.facilities).toEqual({});

    mockedUseScenario.mockReturnValue([
      {
        loading: false,
        failed: false,
        data: mockBaselineScenario,
      },
      noop,
    ]);
    mockedGetFacilities.mockResolvedValue([cloneDeep(userFacility)]);

    // we will control the timing of the reference facility request
    // to ensure there are no intermediate changes
    const mockReferencePromise = new JestMockPromise();
    mockedGetReferenceFacilities.mockReturnValue(mockReferencePromise as any);

    rerender();

    expect(result.current.state.facilities).toEqual({});

    mockReferencePromise.resolve([cloneDeep(referenceFacility)]);

    rerender();

    await waitForValueToChange(() => result.current.state.facilities);

    expect(result.current.state.facilities).toEqual({
      [userFacility.id]: compositeFacility,
    });
  });

  it("updates facilities when the mapping changes", async () => {
    const { result, rerender, wait } = getTestHook();

    const unmappedScenario = {
      ...mockBaselineScenario,
      [referenceFacilitiesProp]: {},
    };
    mockedUseScenario.mockReturnValue([
      {
        loading: false,
        failed: false,
        data: unmappedScenario,
      },
      noop,
    ]);
    mockedGetFacilities.mockResolvedValue([cloneDeep(userFacility)]);

    mockedGetReferenceFacilities.mockResolvedValue([
      cloneDeep(referenceFacility),
    ]);

    rerender();

    await wait(() => !isEmpty(result.current.state.facilities));

    expect(result.current.state.facilities).toEqual({
      [userFacility.id]: userFacility,
    });

    mockedUseScenario.mockReturnValue([
      {
        loading: false,
        failed: false,
        data: mockBaselineScenario,
      },
      noop,
    ]);

    rerender();

    expect(result.current.state.facilities).toEqual({
      [userFacility.id]: compositeFacility,
    });
  });

  it("reports whether reference data can be used", async () => {
    const { result, rerender, wait, waitForValueToChange } = getTestHook();
    expect(result.current.state.facilities).toEqual({});

    mockedUseScenario.mockReturnValue([
      {
        loading: false,
        failed: false,
        data: { ...mockBaselineScenario, useReferenceData: false },
      },
      noop,
    ]);

    mockedGetFacilities.mockResolvedValue([cloneDeep(userFacility)]);

    mockedGetReferenceFacilities.mockResolvedValue([
      cloneDeep(referenceFacility),
    ]);

    rerender();

    await wait(() => !isEmpty(result.current.state.facilities));
    // this is false because there aren't enough reference facilities
    expect(result.current.state.canUseReferenceData).toBe(false);

    mockedUseScenario.mockReturnValue([
      {
        loading: false,
        failed: false,
        data: { ...mockBaselineScenario },
      },
      noop,
    ]);
    rerender();

    await waitForValueToChange(() => result.current.state.canUseReferenceData);
    // this should now be true because the scenario flag is enabled
    expect(result.current.state.canUseReferenceData).toBe(true);

    // set the scenario flag back to false
    mockedUseScenario.mockReturnValue([
      {
        loading: false,
        failed: false,
        data: { ...mockBaselineScenario, useReferenceData: false },
      },
      noop,
    ]);

    // return more reference facilities (expect at least 3 to be required)
    mockedGetReferenceFacilities.mockResolvedValue([
      cloneDeep(referenceFacility),
      { ...cloneDeep(referenceFacility), id: "testReferenceFacility2" },
      { ...cloneDeep(referenceFacility), id: "testReferenceFacility3" },
    ]);

    rerender();
    await waitForValueToChange(() => result.current.state.canUseReferenceData);

    // this should now be true because we have enough reference facilities,
    // even though the feature is not currently toggled active
    expect(result.current.state.canUseReferenceData).toBe(true);
  });
});
