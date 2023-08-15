/*global chrome*/
import axios from "axios";

// the callback should be a function that takes in one argument (token) and uses it to make some sort of API call.
// This function will call the callback with the token obtained.
async function runWithAuthToken(callback) {
  chrome.identity.getAuthToken({ interactive: true }, callback);
}

export async function getStorageData(key) {
  return new Promise((resolve, reject) =>
    chrome.storage.local.get(key, (result) =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  );
}

export async function setStorageData(key, value) {
  return new Promise((resolve, reject) =>
    chrome.storage.local.set({ [key]: value }, () =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve()
    )
  );
}

// Put all of your api calls here, in a format like below, and export them as named exports.
// The callback cb is what you want to happen to the data once it's been fetched.
// Typically, cb will be some sort of setState function.
async function getCalendarData(cb, start, end) {
  const apiCall = async function (token) {
    // Manually made start and end optional parameters, will use the current date if they are not specified
    console.log("Before setting params", start, end);
    if (!end) end = new Date();
    end.setHours(23, 59, 0);
    if (!start) start = new Date();
    start.setHours(0, 0, 0);
    console.log("After setting params", start, end);
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        timeMax: end,
        timeMin: start,
      },
    };

    const url =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events";
    try {
      const response = await axios.get(url, options);
      cb(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  runWithAuthToken(apiCall);
}

// InsertToCalendar inserts an event to the user's calendar
export async function InsertToCalendar(cb, data) {
  const apiCall = async function (token) {
    const options = {
      url: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data,
    };

    try {
      const response = await axios(options);
      cb(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  runWithAuthToken(apiCall);
}

// SmartSchedule returns three possible schedules based on the user's preferences and availability
async function SmartSchedule(
  start,
  end,
  duration,
  preferenceOptions,
  setSmartSchedules
) {
  const parseEventsCallback = (eventsData) => {
    const impossibleIntervalsForScheduling = [];

    eventsData.items.forEach((e) => {
      impossibleIntervalsForScheduling.push([
        new Date(e.start.dateTime),
        new Date(e.end.dateTime),
      ]);
    });

    const possibleIntervals = findAvailableSchedules(
      impossibleIntervalsForScheduling,
      duration,
      start,
      end
    );

    possibleIntervals.sort((i1, i2) =>
      preferenceComp(i1, i2, preferenceOptions)
    );

    setSmartSchedules(possibleIntervals);
  };

  await getCalendarData(parseEventsCallback, start, end);
}

// findAvailableSchedules returns an array of intervals that are available for scheduling
export function findAvailableSchedules(
  impossibleIntervals,
  duration,
  start,
  end
) {
  let curEventStart = start;
  const possibleIntervals = [];

  while (curEventStart <= end.getTime() - duration) {
    let noOverLap = true;
    for (const i of impossibleIntervals) {
      let [iStart, iEnd] = i;
      if (
        isOverLap(
          curEventStart,
          new Date(curEventStart.getTime() + duration),
          iStart,
          iEnd
        )
      ) {
        noOverLap = false;
      }
    }
    if (noOverLap) {
      possibleIntervals.push([
        curEventStart,
        new Date(curEventStart.getTime() + duration),
      ]);
    }
    curEventStart = new Date(curEventStart.getTime() + duration);
  }
  return possibleIntervals;
}

// isOverLap returns true if the two intervals overlap
export function isOverLap(s1, e1, s2, e2) {
  return s1 < e2 && e1 > s2;
}

// preferenceComp compares two intervals based on the user's preferences
export function preferenceComp(i1, i2, preferenceOptions) {
  let i1Score = 0;
  let i2Score = 0;

  const { preferredDaysOfWeek, preferredTimeRange, eventHistory } =
    preferenceOptions;

  // const eventHistory =

  if (preferredDaysOfWeek.includes(i1[0].getDay())) {
    // use start time for the day if the interval crosses two dates
    i1Score++;
  }
  if (preferredDaysOfWeek.includes(i2[0].getDay())) {
    i2Score++;
  }

  if (
    computeRawMinutes(i1[0].getHours(), i1[0].getMinutes()) >=
      computeRawMinutes(
        preferredTimeRange[0].Hours,
        preferredTimeRange[0].Minutes
      ) &&
    computeRawMinutes(i1[0].getHours(), i1[0].getMinutes()) <=
      computeRawMinutes(
        preferredTimeRange[1].Hours,
        preferredTimeRange[1].Minutes
      )
  ) {
    // more score if the interval starts in the preferred time range
    i1Score += 2;
  }

  if (
    computeRawMinutes(i2[0].getHours(), i2[0].getMinutes()) >=
      computeRawMinutes(
        preferredTimeRange[0].Hours,
        preferredTimeRange[0].Minutes
      ) &&
    computeRawMinutes(i2[0].getHours(), i2[0].getMinutes()) <=
      computeRawMinutes(
        preferredTimeRange[1].Hours,
        preferredTimeRange[1].Minutes
      )
  ) {
    i2Score += 2;
  }

  //At this point, if scores are not equal, then return preferred time slot
  if (i2Score !== i1Score || eventHistory === undefined) {
    return i2Score - i1Score;
  }

  //At this point, it is known that both day and time preferences are satisfied for both time slots.
  // We will use caching (previous smart scheduler event history) as a tiebraker.
  // Whichever time slot has more hits with the cache will be chosen as the preferred slot.
  for (let i = 0; i < eventHistory.length; i += 1) {
    let { end, start } = eventHistory[i];
    let parsedStart = new Date(Date.parse(start.dateTime));
    let parsedEnd = new Date(Date.parse(end.dateTime));

    //Compare this event in event history with i1 and add score if it overlaps
    if (
      !(
        computeTime(parsedStart) > computeTime(i1[1]) ||
        computeTime(parsedEnd) < computeTime(i1[0])
      )
    ) {
      i1Score++;
    }
    if (
      !(
        computeTime(parsedStart) > computeTime(i2[1]) ||
        computeTime(parsedEnd) < computeTime(i2[0])
      )
    ) {
      i2Score++;
    }
  }

  //given event history, choose time slot that is most frequent in history
  return i2Score - i1Score;
}

function computeTime(date) {
  return computeRawMinutes(date.getHours(), date.getMinutes());
}

// computeRawMinutes returns the number of minutes given hour and minutes
function computeRawMinutes(hour, minutes) {
  return hour * 60 + minutes;
}

// getDayOfWeek returns the day of the week given timestamp
export function getDayOfWeek(timestamp) {
  return new Date(timestamp).getDay();
}

export default SmartSchedule;
