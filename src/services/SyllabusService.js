/*global chrome */
import axios from "axios";

async function runWithAuthToken(callback) {
  chrome.identity.getAuthToken({ interactive: true }, callback);
}

/** use gcal api to insert an event to gcal */
async function insertCalendarEvent(eventJson, handleAddStatus, ind) {
  const apiCall = async function (token) {
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const url =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events";
    try {
      const response = await axios.post(
        url,
        JSON.stringify(eventJson),
        options
      );
      console.log(response);
      handleAddStatus(ind);
    } catch (error) {
      console.log(error);
    }
  };
  runWithAuthToken(apiCall);
}

async function processSyllabus(selectedFile) {
  var formData = new FormData();
  formData.append("file", selectedFile);
  const url = "http://localhost:3001/processDoc";
  var eventJson;
  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "undefined",
      },
    });
    console.log("eventJson is");
    console.log(response.data.eventJson);
    eventJson = response.data.eventJson;
  } catch (error) {
    console.log(error);
  }
  return eventJson;
}

export { insertCalendarEvent, processSyllabus };
