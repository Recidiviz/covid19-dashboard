import { getNewestRt, getOldestRt } from "../rt";

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
});
