import React, { useState } from "react";
import { BlackButton } from "../components/Button";
import Header from "./../components/Header";
import {
  insertCalendarEvent,
  processSyllabus,
} from "../services/SyllabusService";
import { FileUploader } from "react-drag-drop-files";
import Container from "./../components/Container";
import "../App.css";
const fileTypes = ["PDF"];

const UploadSyllabus = ({ pageCallback }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [calendarEvent, setCalendarEvent] = useState([]);
  const [calendatEventStatus, setCalendatEventStatus] = useState([]);
  const [insertStatus, setInsertStatus] = useState(" ");

  const handleChange = (file) => {
    console.log(`file type is ${typeof file}`);
    setSelectedFile(file);
  };

  const handleAddStatus = (i) => {
    let calendarEventStatuses = [...calendatEventStatus];
    let eventStatus = { ...calendarEventStatuses[i] };
    eventStatus = true;
    calendarEventStatuses[i] = eventStatus;
    setCalendatEventStatus(calendarEventStatuses);
  };

  async function handleAdd(i) {
    console.log("adding to calendar", i);
    await insertCalendarEvent(calendarEvent.at(i), handleAddStatus, i);
  }

  async function handleScan() {
    setInsertStatus("Scanning...");
    setCalendarEvent([]);
    const eventJson = await processSyllabus(
      selectedFile
      // setCalendarEvent,
      // setCalendatEventStatus
    );
    setCalendarEvent(eventJson);
    setCalendatEventStatus(new Array(eventJson.length).fill(false));
    setInsertStatus("Finished Scanning!");
    console.log(calendatEventStatus);
  }

  const parseTime = (timeStr) => {
    let date, time;
    [date, time] = timeStr.split("T");
    return [date, time];
  };

  const parseEventJson = (eventJson) => {
    if (
      eventJson.start.dateTime === null ||
      eventJson.start.dateTime === undefined
    ) {
      console.log(eventJson.start.dateTime);
      return (
        <>
          <div>
            from:
            {eventJson.start.date}
          </div>
          <div>
            to:
            {eventJson.end.date}
          </div>
        </>
      );
    } else {
      return (
        <>
          <div>
            from:
            {parseTime(eventJson.start.dateTime)[0]}
            at
            {parseTime(eventJson.start.dateTime)[1]}
          </div>
          <div>
            to:
            {parseTime(eventJson.end.dateTime)[0]}
            at
            {parseTime(eventJson.end.dateTime)[1]}
          </div>
        </>
      );
    }
  };
  return (
    <div>
      <Header text={"Upload Syllabus"} buttonCallback={pageCallback} />
      {/* <img src="gcal.png" alt="gcal" className="w-32" /> */}
      <Container>
        <div className="flex flex-col gap-2">
          <p>Make sure the file name contains the Course name!</p>
          <FileUploader
            multiple={false}
            handleChange={handleChange}
            name="file"
            types={fileTypes}
            data-testid="fileupload"
          />
          <p>
            {selectedFile
              ? `File name: ${selectedFile.name}`
              : "no files uploaded yet"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <BlackButton onClick={handleScan}>Scan</BlackButton>
          <p>{insertStatus}</p>
        </div>
        <div className="flex flex-col gap-2">
          {calendarEvent.length === 0 ? (
            <p>No Event Found!</p>
          ) : (
            calendarEvent.map((eventJson, i) => {
              return (
                <div key={i}>
                  <div>{eventJson.summary}</div>
                  {parseEventJson(eventJson)}
                  <button
                    className="c2-button"
                    onClick={() => {
                      handleAdd(i);
                    }}
                    disabled={calendatEventStatus[i]}
                  >
                    {calendatEventStatus[i] ? "Added" : "Add to Calendar"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Container>
    </div>
  );
};

export default UploadSyllabus;
