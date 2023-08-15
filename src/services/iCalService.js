/*global chrome*/
import ical from "ical";

export const getIcalData = async () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["iCalUrl"], (result) => {
      if (chrome.runtime.lastError)
        reject(
          new Error(
            "[getIcalData] error getting iCalUrl from chrome.storage: " +
              chrome.runtime.lastError.message
          )
        );

      if (result.iCalUrl == null) {
        reject(new Error("[getIcalData] iCal URL not found."));
      }

      console.log("get iCalUrl: " + result.iCalUrl);
      resolve(result.iCalUrl);
    });
  });
};

export const parseIcal = async () => {
  return new Promise(async (resolve, reject) => {
    // Obtain iCal Url from MyUCLA stored in chrome local storage.
    let iCalUrl;
    try {
      var me = require("./iCalService.js");
      iCalUrl = await me.getIcalData();

      console.log("parseIcal obtained iCalUrl: ", iCalUrl);
    } catch (err) {
      return reject(
        new Error(
          "[parseIcal] unsuccessful call to getIcalData: " + err.message
        )
      );
    }

    // Get .ics file from Url.
    try {
      fetch(iCalUrl).then((res) => {
        res.text().then((data) => {
          let events = ical.parseICS(`${data}`);
          console.log("events: ", events);
          resolve(events);
        });
      });
    } catch (err) {
      reject(
        new Error(
          "[parseIcal] error fetching file from url or package error parsing it: " +
            err.message
        )
      );
    }
  });
};

export let global_events, helper_resolve_callback;

export const processEvents = async (token, calendarId) => {
  const insertEventEndpoint = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

  var me = require("./iCalService.js");
  console.log("processing global_events:", me.global_events);

  for (let k in me.global_events) {
    if (me.global_events.hasOwnProperty(k)) {
      let event = me.global_events[k];
      if (event.type === "VEVENT") {
        /* Unused event properties from .ics file:
            categories[]:
            dtstamp:
            params[]:
            type (VEVENT)
        */

        let gcalEventResource = {};

        // Event description.
        if (event.hasOwnProperty("description")) {
          gcalEventResource = {
            ...gcalEventResource,
            description: event.description,
          };
        }

        // Start date/time info.
        // All-day events are processed as strings of format yyyy-mm-dd.
        // Regular events follow Date/Time standard specified by RFC3339.
        if (event.hasOwnProperty("start")) {
          // Convert from yyyymmdd format to yyyy-mm-dd.
          if (typeof event.start === "string") {
            let formattedDateStr = event.start.replace(
              /(\d{4})(\d{2})(\d{2})/g,
              "$1-$2-$3"
            );
            gcalEventResource = {
              ...gcalEventResource,
              start: {
                date: formattedDateStr,
              },
            };
          } else {
            gcalEventResource = {
              ...gcalEventResource,
              start: {
                dateTime: event.start.toISOString(),
                timeZone: "America/Los_Angeles",
              },
            };
          }
        }

        // Event end date/time info. Same properties as event start.
        if (event.hasOwnProperty("end")) {
          // Check for all-day event.
          if (typeof event.end === "string") {
            let formattedDateStr = event.end.replace(
              /(\d{4})(\d{2})(\d{2})/g,
              "$1-$2-$3"
            );
            gcalEventResource = {
              ...gcalEventResource,
              end: {
                date: formattedDateStr,
              },
            };
          } else {
            gcalEventResource = {
              ...gcalEventResource,
              end: {
                dateTime: event.end.toISOString(),
                timeZone: "America/Los_Angeles",
              },
            };
          }
        }

        // Event location.
        if (event.hasOwnProperty("location")) {
          gcalEventResource = {
            ...gcalEventResource,
            location: event.location,
          };
        }

        // Event organizer.
        if (event.hasOwnProperty("organizer")) {
          gcalEventResource = {
            ...gcalEventResource,
            organizer: {
              displayName: "MyUCLA",
              email: event.organizer.slice(7), // Strip off mailto: prefix to obey internet standard.
            },
          };
        }

        // Add timezone info to RRULE string to comply with GCal API.
        if (event.hasOwnProperty("rrule")) {
          let rrule = event.rrule;
          let splitRrule = rrule.split(";");
          splitRrule[1] = splitRrule[1] + "Z";
          rrule = splitRrule.join(";");
          gcalEventResource = {
            ...gcalEventResource,
            recurrence: [`${rrule}`],
          };
        }

        // Sequence.
        if (event.hasOwnProperty("sequence")) {
          gcalEventResource = {
            ...gcalEventResource,
            sequence: event.sequence,
          };
        }

        // Summary (title).
        if (event.hasOwnProperty("summary")) {
          gcalEventResource = { ...gcalEventResource, summary: event.summary };
        }

        // uid: iCalUID
        // if (event.hasOwnProperty("uid")) {
        //   gcalEventResource = { ...gcalEventResource, iCalUID: event.uid };
        // }

        // API call to insert EventResource object into the calendar ID passed in.
        console.log("EventResource:", gcalEventResource);

        try {
          await fetch(insertEventEndpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(gcalEventResource),
          }).then(async (res) => {
            let insert_result = await res.json();
            console.log("insert result:", insert_result);
          });
        } catch (err) {
          console.log(
            "[processEvents] error inserting event into calendar: " +
              err.message
          );
        }
      }
    }
  }
  me.helper_resolve_callback("Import Successful.");
  return me.global_events;
};

export const runWithAuthToken = async (callback) => {
  chrome.identity.getAuthToken(
    {
      interactive: true,
    },
    callback
  );
};

export const insertCalendar = (token, resolve, reject) => {
  const insertCalendarEndpoint =
    "https://www.googleapis.com/calendar/v3/calendars";

  // Create new MyUCLA calendar for user.
  fetch(insertCalendarEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      summary: "MyUCLA Course Schedule [Kronos]",
    }),
  })
    .then(async (res) => {
      let obj = await res.json();
      console.log("calendar id: ", obj.id);

      // Insert events into calendar.
      processEvents(token, obj.id);

      // helper_resolve_callback("Import Successful."); // This is displayed on the extension.
      resolve("Success from insertCalendar.");
    })
    .catch((err) =>
      reject(
        new Error(
          "[insertCalendar] error creating calendar for user: " + err.message
        )
      )
    );
};

export let filtered_calendars;
export const fireOffToGcal = () => {
  var me = require("./iCalService.js");

  const gCalWorker = (token) => {
    return new Promise(async (resolve, reject) => {
      // Delete any previously created calendar(s) for the user.
      let calendarAlreadyExists = false;
      const getCalendarListEndpoint =
        "https://www.googleapis.com/calendar/v3/users/me/calendarList";
      const deleteCalendarEndpoint =
        "https://www.googleapis.com/calendar/v3/users/me/calendarList";

      try {
        const fetchRes = await fetch(getCalendarListEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let calendarList = await fetchRes.json();
        console.log("getCalendarListEndpoint: ", calendarList);

        // Regex to identify previous Kronos calendar(s).
        const regex = /MyUCLA Course Schedule \[Kronos\]/;
        filtered_calendars = calendarList.items.filter((calendar) => {
          return (
            calendar.summary.match(regex) !== [] &&
            calendar.summary.match(regex) !== null
          );
        });
        if (filtered_calendars.length !== 0) {
          calendarAlreadyExists = true;
        }
        console.log(
          "Calendar already exists. [True/False]? ",
          calendarAlreadyExists
        );
        console.log("Kronos calendars: ", filtered_calendars);

        if (calendarAlreadyExists) {
          // Delete previous Kronos calendar(s).
          filtered_calendars.forEach((calendar) => {
            const url = `${deleteCalendarEndpoint}/${calendar.id}`;
            fetch(url, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((delete_res) => {
                // Successful DELETE operation returns empty response.
                me.insertCalendar(token, resolve, reject);
              })
              .catch((err) => {
                reject(
                  new Error(
                    "[gCalWorker] error deleting previous Kronos calendar(s): " +
                      err.message
                  )
                );
              });
          });
        } else {
          me.insertCalendar(token, resolve, reject);
        }
      } catch (err) {}
    });
  };

  return new Promise(async (resolve, reject) => {
    try {
      helper_resolve_callback = resolve;
      await me.runWithAuthToken(gCalWorker);
    } catch (err) {
      reject(
        new Error(
          "[fireOffToGcal] error in runWithAuthToken and/or callback: " +
            err.message
        )
      );
    }
  });
};

export const importIcalIntoGcal = () => {
  return new Promise((resolve, reject) => {
    try {
      parseIcal().then((events) => {
        global_events = events;
        fireOffToGcal().then((status) => {
          console.log("status:", status);
          resolve(status);
        });
      });
    } catch (err) {
      reject(new Error("[importIcalIntoGcal] error: " + err.message));
    }
  });
};
