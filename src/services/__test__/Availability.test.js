import { generateIntervals } from "../Availability.js";

// Tests consist of several events scheduled in the first two days of a two week period.
// We check expected values of intervals generated.

describe("Test Generate Intervals", () => {
  const e1 = new Date(2020, 1, 1, 9, 0, 0);
  const e2 = new Date(2020, 1, 1, 17, 0, 0);
  const e3 = new Date(2020, 1, 2, 9, 0, 0);
  const e4 = new Date(2020, 1, 2, 17, 0, 0);
  const e5 = new Date(2020, 1, 1, 12, 0, 0);
  const e6 = new Date(2020, 1, 1, 15, 0, 0);
  const e7 = new Date(2020, 1, 1, 16, 0, 0);

  const tests = [
    // No availability
    {
      name: "No Availability",
      startTime: new Date(2020, 1, 1, 9, 0, 0),
      endTime: new Date(2020, 1, 1, 17, 0, 0),
      events: [
        {
          start: new Date(2020, 1, 1, 8, 0, 0, 0),
          end: new Date(2020, 1, 1, 11, 0, 0, 0),
        },
        {
          start: new Date(2020, 1, 1, 10, 0, 0, 0),
          end: new Date(2020, 1, 1, 15, 0, 0, 0),
        },
        {
          start: new Date(2020, 1, 1, 15, 0, 0, 0),
          end: new Date(2020, 1, 1, 18, 0, 0, 0),
        },
        {
          start: new Date(2020, 1, 2, 9, 0, 0),
          end: new Date(2020, 1, 2, 13, 0, 0),
        },
        {
          start: new Date(2020, 1, 2, 12, 14, 0),
          end: new Date(2020, 1, 2, 21, 0, 0),
        },
        {
          start: new Date(2020, 1, 3, 9, 0, 0),
          end: new Date(2020, 1, 3, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 4, 9, 0, 0),
          end: new Date(2020, 1, 4, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 5, 9, 0, 0),
          end: new Date(2020, 1, 5, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 6, 9, 0, 0),
          end: new Date(2020, 1, 6, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 7, 9, 0, 0),
          end: new Date(2020, 1, 7, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 8, 9, 0, 0),
          end: new Date(2020, 1, 8, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 9, 9, 0, 0),
          end: new Date(2020, 1, 9, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 10, 9, 0, 0),
          end: new Date(2020, 1, 10, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 11, 9, 0, 0),
          end: new Date(2020, 1, 11, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 12, 9, 0, 0),
          end: new Date(2020, 1, 12, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 13, 9, 0, 0),
          end: new Date(2020, 1, 13, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 14, 9, 0, 0),
          end: new Date(2020, 1, 14, 17, 0, 0),
        },
      ],
      expectedLen: 0,
    },
    {
      name: "Full Availability over first two days",
      startTime: new Date(2020, 1, 1, 9, 0, 0),
      endTime: new Date(2020, 1, 1, 17, 0, 0),
      events: [
        {
          start: new Date(2020, 1, 3, 9, 0, 0),
          end: new Date(2020, 1, 3, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 4, 9, 0, 0),
          end: new Date(2020, 1, 4, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 5, 9, 0, 0),
          end: new Date(2020, 1, 5, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 6, 9, 0, 0),
          end: new Date(2020, 1, 6, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 7, 9, 0, 0),
          end: new Date(2020, 1, 7, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 8, 9, 0, 0),
          end: new Date(2020, 1, 8, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 9, 9, 0, 0),
          end: new Date(2020, 1, 9, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 10, 9, 0, 0),
          end: new Date(2020, 1, 10, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 11, 9, 0, 0),
          end: new Date(2020, 1, 11, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 12, 9, 0, 0),
          end: new Date(2020, 1, 12, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 13, 9, 0, 0),
          end: new Date(2020, 1, 13, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 14, 9, 0, 0),
          end: new Date(2020, 1, 14, 17, 0, 0),
        },
      ],
      expectedLen: 2,
      expected: [
        [e1.toString(), e2.toString()],
        [e3.toString(), e4.toString()],
      ],
    },
    {
      name: "Overlapping Events Day 1",
      startTime: new Date(2020, 1, 1, 9, 0, 0),
      endTime: new Date(2020, 1, 1, 17, 0, 0),
      events: [
        // Day 1
        {
          start: new Date(2020, 1, 1, 8, 0, 0),
          end: new Date(2020, 1, 1, 11, 0, 0),
        },
        {
          start: new Date(2020, 1, 1, 9, 0, 0),
          end: new Date(2020, 1, 1, 12, 0, 0),
        },
        {
          start: new Date(2020, 1, 1, 15, 0, 0),
          end: new Date(2020, 1, 1, 16, 0, 0),
        },
        // Day 2
        {
          start: new Date(2020, 1, 2, 9, 0, 0),
          end: new Date(2020, 1, 2, 17, 0, 0),
        },
        // Fully booked day 3 onwards
        {
          start: new Date(2020, 1, 3, 9, 0, 0),
          end: new Date(2020, 1, 3, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 4, 9, 0, 0),
          end: new Date(2020, 1, 4, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 5, 9, 0, 0),
          end: new Date(2020, 1, 5, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 6, 9, 0, 0),
          end: new Date(2020, 1, 6, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 7, 9, 0, 0),
          end: new Date(2020, 1, 7, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 8, 9, 0, 0),
          end: new Date(2020, 1, 8, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 9, 9, 0, 0),
          end: new Date(2020, 1, 9, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 10, 9, 0, 0),
          end: new Date(2020, 1, 10, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 11, 9, 0, 0),
          end: new Date(2020, 1, 11, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 12, 9, 0, 0),
          end: new Date(2020, 1, 12, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 13, 9, 0, 0),
          end: new Date(2020, 1, 13, 17, 0, 0),
        },
        {
          start: new Date(2020, 1, 14, 9, 0, 0),
          end: new Date(2020, 1, 14, 17, 0, 0),
        },
      ],
      expectedLen: 2,
      expected: [
        [e5.toString(), e6.toString()],
        [e7.toString(), e2.toString()],
      ],
    },
  ];

  for (const test of tests) {
    // eslint-disable-next-line jest/valid-title
    it(test.name, () => {
      const actual = generateIntervals(
        test.startTime,
        test.endTime,
        test.events
      );
      const actualLen = actual.length;
      expect(actualLen).toEqual(test.expectedLen);
      if (actualLen > 0) expect(actual).toEqual(test.expected);
    });
  }
});
