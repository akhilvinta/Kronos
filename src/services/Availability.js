/*global chrome*/
import axios from "axios";

// the callback should be a function that takes in one argument (token) and uses it to make some sort of API call.
// This function will call the callback with the token obtained.
async function runWithAuthToken(callback) {
  chrome.identity.getAuthToken({ interactive: true }, callback);
}

// Put all of your api calls here, in a format like below, and export them as named exports.
// The callback cb is what you want to happen to the data once it's been fetched.
// Typically, cb will be some sort of setState function.
async function getAvailability(
  cb = (res) => {
    console.log(res);
  }, //setState function
  calendar
) {
  const apiCall = async function (token) {
    let calendarID;
    const startTime = new Date();
    startTime.setHours(9, 0, 0);
    const endTime = new Date();
    endTime.setHours(17, 0, 0);
    // Two weeks after today
    const startInterval = new Date();
    startInterval.setHours(0, 0, 0);
    const twoWeeks = 12096e5;
    const endInterval = new Date(Date.now() + twoWeeks);
    endInterval.setHours(23, 59, 0);
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Add additional query parameters here
      params: {
        timeMax: endInterval,
        timeMin: startInterval,
        orderBy: "startTime",
        singleEvents: true,
      },
    };

    if (calendar === null) {
      calendarID = "primary";
    } else {
      try {
        const calendarIdUrl =
          "https://www.googleapis.com/calendar/v3/users/me/calendarList";
        const calendarIdOptions = {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const res = await axios.get(calendarIdUrl, calendarIdOptions);
        const items = res.data.items;
        for (let i = 0; i < items.length; i += 1) {
          if (items[i].summary === calendar) {
            calendarID = items[i].id;
            break;
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events`;
    try {
      let response = await axios.get(url, options);
      // Events are now ordered by startTime.
      // Throw away everything but the starTime and endTime. We don't care about it.
      const events = response.data.items.map(
        ({ summary, start: { dateTime: s }, end: { dateTime: e } }) => ({
          summary,
          start: new Date(s),
          end: new Date(e),
        })
      );
      const availability = generateIntervals(startTime, endTime, events);
      const formattedAvailability = format(availability);
      cb(formattedAvailability);
    } catch (error) {
      cb(["Oops, that calendar does not exist"]);
    }
  };

  runWithAuthToken(apiCall);
}

// Each interval must be at least 1hr in length.
// Start today, keep going for two weeks, M-F, from startTime to endTime.
// Let's assume all events only last one day.
/// -------------------
//               ---------------

export function generateIntervals(startTime, endTime, events) {
  let intervals = [];
  let begin = startTime;
  let end = endTime;

  //Filter out all events that have invalid dates.
  events = events.filter(
    (a) =>
      a.start.toString() !== "Invalid Date" &&
      a.end.toString() !== "Invalid Date"
  );

  const days = 14;
  for (let d = 0; d < days; d += 1) {
    // Go to the next day
    while (events.length > 0) {
      if (normalize(begin) >= normalize(end)) {
        break;
      }
      let event = events[0];
      // There are no events scheduled for this day after 5PM
      if (normalize(event.start) > normalize(end)) {
        intervals.push([begin.toString(), end.toString()]);
        // If the event in question is on the same day, then we need to get rid of it. (post 5PM start)
        if (
          event.start.getMonth() === begin.getMonth() &&
          event.end.getDate() === begin.getDate()
        ) {
          events.shift();
        }
        break;
      } else {
        // There are events scheduled on this day between 9-5
        if (normalize(begin) < normalize(event.start)) {
          intervals.push([begin.toString(), event.start.toString()]);
          begin = event.end;
          events.shift();
        }
        // Overlapping events
        else if (normalize(begin) >= normalize(event.end)) {
          events.shift();
        } else if (
          normalize(begin) >= normalize(event.start) &&
          normalize(begin) < normalize(event.end)
        ) {
          begin = event.end;
          events.shift();
        }
      }
    }

    // If there are no events left, we should schedule the whole day
    if (events.length === 0 && normalize(begin) < normalize(end)) {
      intervals.push([begin.toString(), end.toString()]);
    }

    begin.setDate(begin.getDate() + 1);
    end.setDate(end.getDate() + 1);
    begin.setHours(9, 0, 0);
    end.setHours(17, 0, 0);
  }

  return intervals;
}

function format(availabilities) {
  const formattedAvailabilities = [];

  if (availabilities.length === 0) {
    formattedAvailabilities.push(
      "Sorry, you have no availability for the given time window"
    );
    return formattedAvailabilities;
  }

  const options = {
    hour12: true,
    weekday: "long",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  const locale = "en-US";

  for (let i = 0; i < availabilities.length; i += 1) {
    let [start, end] = availabilities[i];
    let [dayOfWeek, date, startTime, amPmStart] = new Date(Date.parse(start))
      .toLocaleString(locale, options)
      .split(" ");
    // Throw away saturday and sunday
    if (dayOfWeek === "Saturday," || dayOfWeek === "Sunday,") {
      continue;
    }
    //'Saturday, 11/26, 3:56 PM'
    let parsedEnd = new Date(Date.parse(end))
      .toLocaleString(locale, options)
      .split(" ");
    let endTime = parsedEnd[2];
    let amPmEnd = parsedEnd[3];
    let formattedAvailability = `${dayOfWeek} ${date}    ${startTime} ${amPmStart} - ${endTime} ${amPmEnd}`;
    formattedAvailabilities.push(formattedAvailability);
  }

  return formattedAvailabilities;
}

function normalize(date) {
  return Math.floor(date.getTime() / 1000);
}
export default getAvailability;
