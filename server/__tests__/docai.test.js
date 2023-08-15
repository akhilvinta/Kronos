const { parseTime, parseDate, processLine } = require("../docai");

describe("process line text", () => {
  const tests = [
    {
      name: "test 1",
      lineText: "Final: Dec 6, 8:00-11:00am",
      timeStr: "8:00-11:00am",
      dateStr: "Dec 6",
      eventName: "Final",
    },
    {
      name: "test 2",
      lineText: "Midterm: December 6, 8-11am",
      timeStr: "8-11am",
      dateStr: "December 6",
      eventName: "Midterm",
    },
    {
      name: "no time provided",
      lineText: "Project: Dec 12",
      timeStr: "null",
      dateStr: "Dec 12",
      eventName: "Project",
    },
  ];
  for (const test of tests) {
    // eslint-disable-next-line jest/valid-title
    it(test.name, () => {
      actual = processLine(test.lineText);
      expect(actual).toEqual([test.dateStr, test.timeStr, test.eventName]);
    });
  }
});

describe("parse time", () => {
  const tests = [
    {
      name: "time 1",
      timestr: "3-6pm",
      expected: ["15:00:00", "18:00:00"],
    },
    {
      name: "time 2",
      timestr: "3:00-6:00pm",
      expected: ["15:00:00", "18:00:00"],
    },
  ];
  for (const test of tests) {
    // eslint-disable-next-line jest/valid-title
    it(test.name, async () => {
      const actual = parseTime(test.timestr);
      expect(actual).toEqual(test.expected);
    });
  }
});
describe("parse date", () => {
  const tests = [
    {
      name: "shortened month",
      datestr: "Dec 20",
      expected: "2022-12-20",
    },
    {
      name: "complete month string ",
      datestr: "January 20",
      expected: "2022-01-20",
    },
  ];

  for (const test of tests) {
    // eslint-disable-next-line jest/valid-title
    it(test.name, () => {
      const actual = parseDate(test.datestr);
      expect(actual).toEqual(test.expected);
    });
  }
});
