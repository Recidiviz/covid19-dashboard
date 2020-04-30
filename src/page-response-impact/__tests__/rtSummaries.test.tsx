import { RtData, RtRecord } from "../../infection-model/rt";
import {
  averageRtReductionAcrossFacilities,
  maxRtChange,
  numFacilitiesWithRtLessThan1,
} from "../rtSummaries";

describe("Rt Summary Statistics", () => {
  let facilitiesRtRecords: RtRecord[][];
  beforeEach(() => {
    facilitiesRtRecords = [
      // facility 1
      [
        { date: new Date(2020, 4, 24), value: 3.5 },
        { date: new Date(2020, 3, 24), value: 3 },
        { date: new Date(2020, 2, 24), value: 5 },
      ],
      // facility 2
      [
        { date: new Date(2020, 4, 24), value: 4 },
        { date: new Date(2020, 3, 24), value: 1.5 },
        { date: new Date(2020, 2, 24), value: 3 },
      ],
      // facility 3
      [
        { date: new Date(2020, 4, 24), value: 0.8 },
        { date: new Date(2020, 3, 24), value: 0.5 },
        { date: new Date(2020, 2, 24), value: 1.2 },
      ],
    ];
  });

  describe("numFacilitiesWithRtLessThan1", () => {
    it("should return the number of facilities with < 1 current R(t) value", () => {
      const output = numFacilitiesWithRtLessThan1(facilitiesRtRecords);
      expect(output).toEqual(1);
    });
  });

  describe("averageRtReductionAcrossFacilities", () => {
    it("should return the average R(t) reduction across facilities", () => {
      // Example: If facility 1 went from 3.7 -> 1.7 and Facility 2 when from
      // 3.0 -> 1.5, the average change across those facilities would be 1.5
      const output = averageRtReductionAcrossFacilities(facilitiesRtRecords);
      // (1.5 + -1 + .4) / 3
      expect(output).toEqual(0.3);
    });
  });

  describe("maxRtChange", () => {
    it(
      "should return difference between R(t) of facility with original max " +
        "and facility with current max",
      () => {
        const output = maxRtChange(facilitiesRtRecords);
        // original max value from facility 1 = 5
        // current max value from facility 2 = 4
        expect(output).toEqual(1);
      },
    );
  });
});
