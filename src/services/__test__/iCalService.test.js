jest.setTimeout(60000000);

import { chrome } from "jest-chrome";
import * as icalService from "../iCalService";

describe("function getIcalData", () => {
  it("fetches ical url from chrome local storage", async () => {
    chrome.storage.local.get.mockImplementation((key, callback) => {
      callback({
        iCalUrl: "url",
      });
    });

    const response = await icalService.getIcalData();
    expect(response).toBe("url");
  });

  it("exits gracefully if ical url was not found", async () => {
    chrome.storage.local.get.mockImplementation((key, callback) => {
      callback({
        iCalUrl: null,
      });
    });

    try {
      await icalService.getIcalData();
    } catch (err) {
      expect(err.message).toBe("[getIcalData] iCal URL not found.");
    }
  });

  it("properly catches chrome.runtime.lastError errors", async () => {
    const lastErrorMessage = "Some error thrown by chrome API.";
    const lastErrorGetter = jest.fn(() => lastErrorMessage);
    const lastError = {
      get message() {
        return lastErrorGetter();
      },
    };

    chrome.storage.local.get.mockImplementation((key, callback) => {
      chrome.runtime.lastError = lastError;

      callback({
        iCalUrl: null,
      });

      delete chrome.runtime.lastError;
    });

    try {
      await icalService.getIcalData();
    } catch (err) {
      expect(err.message).toContain(
        "[getIcalData] error getting iCalUrl from chrome.storage:"
      );
    }
  });
});

import ical from "ical";
jest.mock("ical");

describe("function parseIcal", () => {
  const unmockedFetch = global.fetch;

  beforeAll(() => {
    global.fetch = () =>
      Promise.resolve({
        text: () => Promise.resolve("mock_icsfile"),
      });
  });

  afterAll(() => {
    global.fetch = unmockedFetch;
  });

  it("fetches .ics file from ical url and parses it", async () => {
    const spy = jest.spyOn(icalService, "getIcalData");
    spy.mockReturnValue("mock_url");

    const mock_parsed_events = {
      event1: "event1",
      event2: "event2",
    };
    ical.parseICS.mockResolvedValue(mock_parsed_events);

    const response = await icalService.parseIcal();
    expect(response).toBe(mock_parsed_events);

    spy.mockRestore();
  });
});

describe("function processEvents", () => {
  let accumulatedEventResources = [];

  const unmocked_helper_resolve_callback = icalService.helper_resolve_callback;
  const unmockedFetch = global.fetch;

  beforeEach(() => {
    global.fetch = (url, options) => {
      accumulatedEventResources.push(options.body);
      Promise.resolve({
        json: () => Promise.resolve("mock_INSERT_result"),
      });
    };
  });

  afterEach(() => {
    global.fetch = unmockedFetch;
  });

  it("processes parsed events returned by ical pkg into gcal api compatible EventResources", async () => {
    // Test all three types of events, because they are each processed differently.
    icalService.global_events = {
      0: {
        type: "VEVENT",
        description: "mock_description",
        start: "20220919", // All-day event.
        end: "20220919",
        location: "mock_location",
        organizer: "mailto:MyUCLA@college.ucla.edu",
        sequence: "mock_sequence",
        summary: "mock_summary",
      },
      1: {
        type: "VEVENT",
        description: "mock_description",
        start: new Date(
          "Fri Sep 23 2022 17:00:00 GMT-0700 (Pacific Daylight Time)" // One-time event.
        ),
        end: new Date(
          "Fri Sep 23 2022 17:00:00 GMT-0700 (Pacific Daylight Time)"
        ),
        location: "mock_location",
        organizer: "mailto:MyUCLA@college.ucla.edu",
        sequence: "mock_sequence",
        summary: "mock_summary",
      },
      2: {
        type: "VEVENT",
        description: "mock_description",
        start: new Date(
          "Fri Sep 23 2022 14:00:00 GMT-0700 (Pacific Daylight Time)" // Recurring event.
        ),
        end: new Date(
          "Fri Sep 23 2022 15:50:00 GMT-0700 (Pacific Daylight Time)"
        ),
        location: "mock_location",
        organizer: "mailto:MyUCLA@college.ucla.edu",
        rrule: "RRULE:FREQ=WEEKLY;UNTIL=20221202T234500;BYDAY=FR",
        sequence: "mock_sequence",
        summary: "mock_summary",
      },
    };
    icalService.helper_resolve_callback = jest.fn(() => true);

    const expectedEventResource = [
      JSON.stringify({
        description: "mock_description",
        start: {
          date: "2022-09-19",
        },
        end: {
          date: "2022-09-19",
        },
        location: "mock_location",
        organizer: {
          displayName: "MyUCLA",
          email: "MyUCLA@college.ucla.edu",
        },
        sequence: "mock_sequence",
        summary: "mock_summary",
      }),
      JSON.stringify({
        description: "mock_description",
        start: {
          dateTime: "2022-09-24T00:00:00.000Z",
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: "2022-09-24T00:00:00.000Z",
          timeZone: "America/Los_Angeles",
        },
        location: "mock_location",
        organizer: {
          displayName: "MyUCLA",
          email: "MyUCLA@college.ucla.edu",
        },
        sequence: "mock_sequence",
        summary: "mock_summary",
      }),
      JSON.stringify({
        description: "mock_description",
        start: {
          dateTime: "2022-09-23T21:00:00.000Z",
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: "2022-09-23T22:50:00.000Z",
          timeZone: "America/Los_Angeles",
        },
        location: "mock_location",
        organizer: {
          displayName: "MyUCLA",
          email: "MyUCLA@college.ucla.edu",
        },
        recurrence: ["RRULE:FREQ=WEEKLY;UNTIL=20221202T234500Z;BYDAY=FR"],
        sequence: "mock_sequence",
        summary: "mock_summary",
      }),
    ];

    const response = await icalService.processEvents(
      "fakeToken",
      "fakeCalendarId"
    );
    expect(accumulatedEventResources).toStrictEqual(expectedEventResource);

    // Clean up.
    icalService.helper_resolve_callback = unmocked_helper_resolve_callback;
  });
});

describe("function fireOffToGcal", () => {
  const unmockedFetch = global.fetch;

  let calendarListToReturn;
  let runWithAuthTokenSpy, insertCalendarSpy;

  beforeAll(() => {
    global.fetch = () => {
      return Promise.resolve({
        json: () => Promise.resolve(calendarListToReturn),
      });
    };
  });

  beforeEach(() => {
    // Mock runWithAuthToken to call gCalWorker with mock_token.
    runWithAuthTokenSpy = jest.spyOn(icalService, "runWithAuthToken");
    runWithAuthTokenSpy.mockImplementation(async (callback) => {
      console.log("mock_runWithAuthToken was called");
      try {
        const resp = await callback("mock_token");
        console.log("gcalWorker returned.");
        icalService.helper_resolve_callback(resp);
      } catch (err) {
        console.log("[mock_runWithAuthToken]: " + err.message);
      }
    });

    // Mock insertCalendar to pretend insertion is always successful.
    insertCalendarSpy = jest.spyOn(icalService, "insertCalendar");
    insertCalendarSpy.mockImplementation((token, resolve, reject) => {
      console.log("mock_insertCalendar was called");
      resolve(icalService.filtered_calendars);
    });
  });

  afterEach(() => {
    runWithAuthTokenSpy.mockRestore();
    insertCalendarSpy.mockRestore();
  });

  afterAll(() => {
    global.fetch = unmockedFetch;
  });

  it("deletes single previously created Kronos calendar", async () => {
    calendarListToReturn = {
      kind: "calendar#calendarList",
      items: [
        {
          id: "mock_id",
          summary: "MyUCLA Course Schedule [Kronos]",
        },
        {
          id: "mock_id1",
          summary: "mock_summary",
        },
        {
          id: "mock_id2",
          summary: "mock_summary",
        },
      ],
    };
    const expectedCalendarList = [
      {
        id: "mock_id",
        summary: "MyUCLA Course Schedule [Kronos]",
      },
    ];

    const response = await icalService.fireOffToGcal();
    expect(response).toStrictEqual(expectedCalendarList);
  });

  it("deletes multiple previously created Kronos calendars", async () => {
    calendarListToReturn = {
      kind: "calendar#calendarList",
      items: [
        {
          id: "mock_id",
          summary: "MyUCLA Course Schedule [Kronos]",
        },
        {
          id: "mock_id1",
          summary: "MyUCLA Course Schedule [Kronos]",
        },
        {
          id: "mock_id2",
          summary: "mock_summary",
        },
      ],
    };
    const expectedCalendarList = [
      {
        id: "mock_id",
        summary: "MyUCLA Course Schedule [Kronos]",
      },
      {
        id: "mock_id1",
        summary: "MyUCLA Course Schedule [Kronos]",
      },
    ];

    const response = await icalService.fireOffToGcal();
    expect(response).toStrictEqual(expectedCalendarList);
  });

  it("creates a Kronos calendar successfully if nothing found to delete", async () => {
    calendarListToReturn = {
      kind: "calendar#calendarList",
      items: [],
    };
    const expectedCalendarList = [];

    const response = await icalService.fireOffToGcal();
    expect(response).toStrictEqual(expectedCalendarList);
  });
});
