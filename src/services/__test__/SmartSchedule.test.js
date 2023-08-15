import {
  findAvailableSchedules,
  isOverLap,
  preferenceComp,
} from "./../SmartSchedulerService";

describe("Test isOverlap", () => {
  const s1 = new Date(2020, 1, 1, 1, 0, 0);
  const s2 = new Date(2020, 1, 1, 2, 0, 0);
  const s3 = new Date(2020, 1, 1, 3, 0, 0);
  const s4 = new Date(2020, 1, 1, 4, 0, 0);

  it("[s1, s3] overlaps with [s2, s4]", () => {
    expect(isOverLap(s1, s3, s2, s4)).toBe(true);
  });

  it("[s1, s2] does not overlap with [s3, s4]", () => {
    expect(isOverLap(s1, s2, s3, s4)).toBe(false);
  });
});

describe("Test findAvailableSchedules", () => {
  const tests = [
    {
      name: "one hour event in three-hour range",
      impossibleIntervals: [
        [new Date(2020, 1, 1, 1, 0, 0), new Date(2020, 1, 1, 2, 0, 0)],
      ],
      duration: 60 * 60 * 1000,
      start: new Date(2020, 1, 1, 0, 0, 0),
      end: new Date(2020, 1, 1, 3, 0, 0),
      expected: [
        [new Date(2020, 1, 1, 0, 0, 0), new Date(2020, 1, 1, 1, 0, 0)],
        [new Date(2020, 1, 1, 2, 0, 0), new Date(2020, 1, 1, 3, 0, 0)],
      ],
    },
    {
      name: "no events possible",
      impossibleIntervals: [
        [new Date(2020, 1, 1, 0, 0, 0), new Date(2020, 1, 1, 3, 0, 0)],
      ],
      duration: 60 * 60 * 1000,
      start: new Date(2020, 1, 1, 0, 0, 0),
      end: new Date(2020, 1, 1, 3, 0, 0),
      expected: [],
    },
    {
      name: "no impossible intervals",
      impossibleIntervals: [],
      duration: 60 * 60 * 1000,
      start: new Date(2020, 1, 1, 0, 0, 0),
      end: new Date(2020, 1, 1, 3, 0, 0),
      expected: [
        [new Date(2020, 1, 1, 0, 0, 0), new Date(2020, 1, 1, 1, 0, 0)],
        [new Date(2020, 1, 1, 1, 0, 0), new Date(2020, 1, 1, 2, 0, 0)],
        [new Date(2020, 1, 1, 2, 0, 0), new Date(2020, 1, 1, 3, 0, 0)],
      ],
    },
    {
      name: "one task longer than 60 mins",
      impossibleIntervals: [],
      duration: 120 * 60 * 1000,
      start: new Date(2020, 1, 1, 0, 0, 0),
      end: new Date(2020, 1, 1, 4, 0, 0),
      expected: [
        [new Date(2020, 1, 1, 0, 0, 0), new Date(2020, 1, 1, 2, 0, 0)],
        [new Date(2020, 1, 1, 2, 0, 0), new Date(2020, 1, 1, 4, 0, 0)],
      ],
    },
  ];
  for (const test of tests) {
    // eslint-disable-next-line jest/valid-title
    it(test.name, () => {
      const actual = findAvailableSchedules(
        test.impossibleIntervals,
        test.duration,
        test.start,
        test.end
      );
      expect(actual).toEqual(test.expected);
    });
  }
});

describe("Test preferenceComp", () => {
  const s1 = new Date(2020, 1, 1, 8, 0, 0);
  const e1 = new Date(2020, 1, 1, 10, 0, 0);
  const s2 = new Date(2020, 1, 3, 11, 0, 0); // Diff by two days since getDay() is calculated using local timezone
  const e2 = new Date(2020, 1, 3, 12, 0, 0);
  const s3 = new Date(2020, 1, 1, 11, 0, 0);
  const e3 = new Date(2020, 1, 1, 13, 0, 0);
  const s5 = new Date(2020, 1, 1, 17, 0, 0);

  const tests = [
    {
      name: "i1: preferred time in range, preferred day of week; i2: preferred time in range, not preferred day of week",
      i1: [s1, e1],
      i2: [s2, e2],
      preferenceOptions: {
        preferredDaysOfWeek: [s1.getDay()],
        preferredTimeRange: [
          { Hours: s1.getHours(), Minutes: s1.getMinutes() },
          { Hours: e2.getHours(), Minutes: e2.getMinutes() },
        ],
      },
      expected: -1,
    },
    {
      name: "i1: preferred time in range, preferred day of week; i2: not preferred time in range, preferred day of week",
      i1: [s1, e1],
      i2: [s2, e2],
      preferenceOptions: {
        preferredDaysOfWeek: [s2.getDay(), s1.getDay()],
        preferredTimeRange: [
          { Hours: s1.getHours(), Minutes: s1.getMinutes() },
          { Hours: e1.getHours(), Minutes: e1.getMinutes() },
        ],
      },
      expected: -2,
    },
    {
      name: "i1: preferred time in range, preferred day of week; i2: preferred time in range, preferred day of week (same intervals)",
      i1: [s1, e1],
      i2: [s1, e1],
      preferenceOptions: {
        preferredDaysOfWeek: [s1.getDay()],
        preferredTimeRange: [
          { Hours: s1.getHours(), Minutes: s1.getMinutes() },
          { Hours: e1.getHours(), Minutes: e1.getMinutes() },
        ],
        // eventHistory: [
        //   {description: 'work to do', end: e1, location: 'Royce Hall', start: s1, summary: 'homework'},
        // ]
      },
      expected: 0,
    },
    {
      name: "i1: preferred time in range, preferred day of week; i2: not preferred time in range, preferred day of week",
      i1: [s1, e1],
      i2: [s2, e2],
      preferenceOptions: {
        preferredDaysOfWeek: [s1.getDay(), s2.getDay()],
        preferredTimeRange: [
          { Hours: s1.getHours(), Minutes: s1.getMinutes() },
          { Hours: e1.getHours(), Minutes: e1.getMinutes() },
        ],
      },
      expected: -2,
    },
    {
      name: "i1: preferred time in range, preferred day of week; i2: not preferred time in range, not preferred day of week",
      i1: [s1, e1],
      i2: [s2, e2],
      preferenceOptions: {
        preferredDaysOfWeek: [s1.getDay()],
        preferredTimeRange: [
          { Hours: s1.getHours(), Minutes: s1.getMinutes() },
          { Hours: e1.getHours(), Minutes: e1.getMinutes() },
        ],
      },
      expected: -3,
    },
    {
      name: "i1 vs i2, no preference in date and time. i1 has 1 hit in cache and i2 has 0",
      i1: [s1, e1],
      i2: [s3, e3],
      preferenceOptions: {
        preferredDaysOfWeek: [],
        preferredTimeRange: [
          { Hours: s1.getHours(), Minutes: s1.getMinutes() },
          { Hours: s5.getHours(), Minutes: s5.getMinutes() },
        ],
        eventHistory: [
          {
            description: "work to do",
            end: { dateTime: e1.toString(), timeZone: "America/Los_Angeles" },
            location: "Royce Hall",
            start: { dateTime: s1.toString(), timeZone: "America/Los_Angeles" },
            summary: "homework",
          },
        ],
      },
      expected: -1,
    },
    {
      name: "i1 vs i2, no preference in date and time. i1 has 1 hit in cache and i2 has 1",
      i1: [s1, e1],
      i2: [s3, e3],
      preferenceOptions: {
        preferredDaysOfWeek: [],
        preferredTimeRange: [
          { Hours: s1.getHours(), Minutes: s1.getMinutes() },
          { Hours: s5.getHours(), Minutes: s5.getMinutes() },
        ],
        eventHistory: [
          {
            description: "work to do",
            end: { dateTime: e3.toString(), timeZone: "America/Los_Angeles" },
            location: "Royce Hall",
            start: { dateTime: s3.toString(), timeZone: "America/Los_Angeles" },
            summary: "homework",
          },
          {
            description: "work to do",
            end: { dateTime: e1.toString(), timeZone: "America/Los_Angeles" },
            location: "Royce Hall",
            start: { dateTime: s1.toString(), timeZone: "America/Los_Angeles" },
            summary: "homework",
          },
        ],
      },
      expected: 0,
    },
    {
      name: "i1 vs i2, no preference in date and time. i1 has 1 hit in cache and i2 has 2",
      i1: [s1, e1],
      i2: [s3, e3],
      preferenceOptions: {
        preferredDaysOfWeek: [],
        preferredTimeRange: [
          { Hours: s1.getHours(), Minutes: s1.getMinutes() },
          { Hours: s5.getHours(), Minutes: s5.getMinutes() },
        ],
        eventHistory: [
          {
            description: "work to do",
            end: { dateTime: e3.toString(), timeZone: "America/Los_Angeles" },
            location: "Royce Hall",
            start: { dateTime: s3.toString(), timeZone: "America/Los_Angeles" },
            summary: "homework",
          },
          {
            description: "work to do",
            end: { dateTime: e1.toString(), timeZone: "America/Los_Angeles" },
            location: "Royce Hall",
            start: { dateTime: s1.toString(), timeZone: "America/Los_Angeles" },
            summary: "homework",
          },
          {
            description: "work to do",
            end: { dateTime: e3.toString(), timeZone: "America/Los_Angeles" },
            location: "Royce Hall",
            start: { dateTime: s3.toString(), timeZone: "America/Los_Angeles" },
            summary: "homework",
          },
        ],
      },
      expected: 1,
    },
  ];
  for (const test of tests) {
    // eslint-disable-next-line jest/valid-title
    it(test.name, () => {
      const actual = preferenceComp(test.i1, test.i2, test.preferenceOptions);
      expect(actual).toEqual(test.expected);
    });
  }
});
