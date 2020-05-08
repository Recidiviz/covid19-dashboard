import { advanceTo } from "jest-date-mock";

import { getDaysAgoRt, getNewestRt, getOldestRt } from "../rt";

describe("getNewestRt and getOldestRt", () => {
  const rtRecords = [
    { date: new Date("2020-04-30"), value: 1 },
    { date: new Date("2020-04-25"), value: 1 },
    { date: new Date("2020-04-29"), value: 1 },
    { date: new Date("2020-5-5"), value: 1 },
    { date: new Date("2020-5-1"), value: 1 },
  ];

  test("getNewestRt returns the newest RTRecord", () => {
    expect(getNewestRt(rtRecords)).toEqual(rtRecords[3]);
  });

  test("getOldestRt returns the oldest RTRecord", () => {
    expect(getOldestRt(rtRecords)).toEqual(rtRecords[1]);
  });

  test("getDaysAgoRt returns the newest record that is at least X days old", () => {
    advanceTo(new Date(2020, 4, 5, 12));
    expect(getDaysAgoRt(rtRecords, 0)).toEqual(rtRecords[3]);
    expect(getDaysAgoRt(rtRecords, 1)).toEqual(rtRecords[4]);
    expect(getDaysAgoRt(rtRecords, 5)).toEqual(rtRecords[0]);
  });
});
