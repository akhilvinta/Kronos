import React, { useState } from "react";
import Header from "./../components/Header";
import Container from "./../components/Container";

import DatePicker from "react-datepicker";

import { compileEnum } from "../constants";

import "react-datepicker/dist/react-datepicker.css";
import SmartSchedule, {
  getStorageData,
  InsertToCalendar,
  setStorageData,
} from "./../services/SmartSchedulerService";
import dayjs from "dayjs";
import Button from "../components/Button";
import { useEffect } from "react";
import { BlackButton } from "./../components/Button";
dayjs().format();

const SmartSchedulerPages = compileEnum([
  "TASKINFO",
  "PREFERENCES",
  "RESULTS",
  "EVENTHISTORY",
]);

const SmartScheduler = ({ pageCallback }) => {
  const [steps, setSteps] = useState(SmartSchedulerPages.TASKINFO);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });
  const [daysOfWeek, setDaysOfWeek] = useState({
    Sun: {
      dayIndex: 0, // dayIndex is used to compare Date.getDay()
      selected: false,
      displayName: "S",
    },
    Mon: {
      dayIndex: 1,
      selected: false,
      displayName: "M",
    },
    Tue: {
      dayIndex: 2,
      selected: false,
      displayName: "T",
    },
    Wed: {
      dayIndex: 3,
      selected: false,
      displayName: "W",
    },
    Thu: {
      dayIndex: 4,
      selected: false,
      displayName: "T",
    },
    Fri: {
      dayIndex: 5,
      selected: false,
      displayName: "F",
    },
    Sat: {
      dayIndex: 6,
      selected: false,
      displayName: "S",
    },
  });
  const [timeOfDay, setTimeOfDay] = useState({
    start: { Hours: 8, Minutes: 0 },
    end: { Hours: 17, Minutes: 0 },
  });
  const [durationHour, setDurationHour] = useState(0);
  const [durationMin, setDurationMin] = useState(30);
  const [smartSchedules, setSmartSchedules] = useState([]);
  const [summary, setSummary] = useState("Task Name");
  const [description, setDescription] = useState("Task Description");
  const [location, setLocation] = useState("e.g. Royce Hall");
  const [eventHistory, setEventHistory] = useState([]);

  useEffect(() => {
    const fetchEventHistory = async () => {
      const res = await getStorageData("eventHistory");
      const { eventHistory } = res;
      if (eventHistory) {
        setEventHistory(eventHistory);
      }
    };
    fetchEventHistory();
  }, [setEventHistory]);

  const computeDuration = (hour, mins) => {
    return (hour * 60 + mins) * 60 * 1000;
  };

  const countSelectedDays = () => {
    return Object.values(daysOfWeek).filter((day) => day.selected).length;
  };

  const toggleSelectedByDay = (day) => {
    if (countSelectedDays() >= 3 && !daysOfWeek[day].selected) {
      // <= 3 days selected
      return;
    }
    setDaysOfWeek({
      ...daysOfWeek,
      [day]: {
        ...daysOfWeek[day],
        selected: !daysOfWeek[day].selected,
      },
    });
  };

  const handleSubmit = async () => {
    // TODO: implement check for valid input
    const preferredDaysOfWeek = Object.values(daysOfWeek)
      .filter((d) => d.selected)
      .map((d) => d.dayIndex);
    const preferredTimeRange = [timeOfDay.start, timeOfDay.end];
    const res = await getStorageData("eventHistory");
    const { eventHistory } = res;
    const preferenceOptions = {
      preferredDaysOfWeek,
      preferredTimeRange,
      eventHistory,
    };

    console.log("preferenceOptions", preferenceOptions);
    console.log("duration hour: " + durationHour);
    console.log("duration min: " + durationMin);
    console.log(
      "total duration: " + computeDuration(durationHour, durationMin)
    );

    await SmartSchedule(
      startDate,
      endDate,
      computeDuration(durationHour, durationMin),
      preferenceOptions,
      setSmartSchedules
    );
    setSteps(SmartSchedulerPages.RESULTS);
  };

  const createNewEvent = async (startTime, endTime) => {
    const data = {
      summary,
      description,
      location,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "America/Los_Angeles", // TODO: get timezone from user
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "America/Los_Angeles",
      },
    };
    await InsertToCalendar(() => {}, data);
    const res = await getStorageData("eventHistory");
    const { eventHistory } = res;

    const newHistory = eventHistory ? [...eventHistory, data] : [data];
    await setStorageData("eventHistory", newHistory);
    // Return to the home page after scheduling
    console.log(eventHistory);
    console.log(typeof eventHistory);
    pageCallback();
  };

  return (
    <div>
      <Header text={"Smart Scheduler"} buttonCallback={pageCallback}></Header>
      {steps === SmartSchedulerPages.TASKINFO && (
        <TaskInfoPage
          pageCallback={pageCallback}
          setSteps={setSteps}
          durationHour={durationHour}
          durationMin={durationMin}
          setDurationHour={setDurationHour}
          setDurationMin={setDurationMin}
          summary={summary}
          setSummary={setSummary}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
        />
      )}
      {steps === SmartSchedulerPages.PREFERENCES && (
        <PreferencesPage
          daysOfWeek={daysOfWeek}
          toggleSelectedByDay={toggleSelectedByDay}
          timeOfDay={timeOfDay}
          setTimeOfDay={setTimeOfDay}
          handleSubmit={handleSubmit}
          startDate={startDate}
          setEndDate={setEndDate}
          endDate={endDate}
          setStartDate={setStartDate}
        />
      )}
      {steps === SmartSchedulerPages.RESULTS && (
        <ResultsPage
          smartSchedules={smartSchedules}
          createNewEvent={createNewEvent}
        />
      )}
      {steps === SmartSchedulerPages.EVENTHISTORY && (
        <EventHistoryPage
          eventHistory={eventHistory}
          setSteps={setSteps}
          setEventHistory={setEventHistory}
        />
      )}
    </div>
  );
};

const TaskInfoPage = ({
  setSteps,
  durationHour,
  durationMin,
  setDurationHour,
  setDurationMin,
  summary,
  setSummary,
  description,
  setDescription,
  location,
  setLocation,
}) => (
  <Container>
    <input
      className="bg-gray-200 border border-gray-400 pl-1"
      value={summary}
      onChange={(e) => setSummary(e.target.value)}
    />
    <EntryWrapper>
      <div>Duration</div>
      <div className="flex gap-2">
        <input
          className="w-6 bg-gray-200 border border-gray-400"
          value={durationHour}
          onChange={(e) => setDurationHour(e.target.value)}
        ></input>
        {"hr"}
        <input
          className="w-6 bg-gray-200 border border-gray-400"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
        ></input>
        {"min"}
      </div>
    </EntryWrapper>
    <EntryWrapper>
      <div>Location</div>
      <input
        className="bg-gray-100 w-full pl-1"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      ></input>
    </EntryWrapper>
    <EntryWrapper>
      <div>Description</div>
      <textarea
        rows="8"
        className="w-full pl-1 bg-gray-200 border border-gray-400"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </EntryWrapper>
    <BlackButton onClick={() => setSteps(SmartSchedulerPages.PREFERENCES)}>
      next
    </BlackButton>
    <Button
      className="bg-gray rounded-sm px-4 py-2"
      onClick={() => setSteps(SmartSchedulerPages.EVENTHISTORY)}
    >
      Check your event history!
    </Button>
  </Container>
);

const PreferencesPage = ({
  daysOfWeek,
  toggleSelectedByDay,
  timeOfDay,
  setTimeOfDay,
  handleSubmit,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const padZeroToTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };
  return (
    <Container>
      <DateWrapper>
        <div>Start Date: </div>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="bg-gray-200 border border-gray-400 pl-2"
        />
      </DateWrapper>
      <DateWrapper>
        <div>End Date: </div>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          className="bg-gray-200 border border-gray-400 pl-2"
        />
      </DateWrapper>

      <EntryWrapper>
        <div>Preferred Days of Week {"(<=3)"}</div>
        <div className="w-full flex gap-1">
          {Object.entries(daysOfWeek).map(([key, value]) => (
            <DayOfWeekButton
              onClick={() => toggleSelectedByDay(key)}
              selected={value.selected}
              key={key}
            >
              {value.displayName}
            </DayOfWeekButton>
          ))}
        </div>
      </EntryWrapper>
      <EntryWrapper>
        <div>Preferred Time of the Day</div>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <select
              className="w-12 bg-gray-200 border border-gray-400"
              onChange={(e) => {
                setTimeOfDay({
                  ...timeOfDay,
                  start: {
                    ...timeOfDay.start,
                    Hours: parseInt(e.target.value),
                  },
                });
              }}
              value={timeOfDay.start.Hours}
            >
              {Array.from(Array(24).keys()).map((hour) => (
                <option value={hour} key={hour}>
                  {padZeroToTime(hour)}
                </option>
              ))}
            </select>
            {":"}

            <select
              className="w-12 bg-gray-200 border border-gray-400"
              onChange={(e) => {
                setTimeOfDay({
                  ...timeOfDay,
                  start: {
                    ...timeOfDay.start,
                    Minutes: parseInt(e.target.value),
                  },
                });
              }}
              value={timeOfDay.start.Minutes}
            >
              {Array.from(Array(60).keys()).map((min) => (
                <option value={min} key={min}>
                  {padZeroToTime(min)}
                </option>
              ))}
            </select>
          </div>

          <div>to</div>
          <select
            className="w-12 bg-gray-200 border border-gray-400"
            onChange={(e) =>
              setTimeOfDay({
                ...timeOfDay,
                end: {
                  ...timeOfDay.end,
                  Hours: parseInt(e.target.value),
                },
              })
            }
            value={timeOfDay.end.Hours}
          >
            {Array.from(Array(24).keys()).map((hour) => (
              <option value={hour} key={hour}>
                {padZeroToTime(hour)}
              </option>
            ))}
          </select>
          {":"}
          <select
            className="w-12 bg-gray-200 border border-gray-400"
            onChange={(e) => {
              setTimeOfDay({
                ...timeOfDay,
                end: {
                  ...timeOfDay.end,
                  Minutes: parseInt(e.target.value),
                },
              });
            }}
            value={timeOfDay.end.Minutes}
          >
            {Array.from(Array(60).keys()).map((min) => (
              <option value={min} key={min}>
                {padZeroToTime(min)}
              </option>
            ))}
          </select>
        </div>
      </EntryWrapper>
      <BlackButton onClick={handleSubmit}>Submit</BlackButton>
    </Container>
  );
};

const ResultsPage = ({ smartSchedules, createNewEvent }) => {
  return (
    <Container>
      <div className="flex flex-col gap-2">
        <div className="mb-2">
          Here's a list of schedules the smart scheduler picked for you!
        </div>
        <ResultPagination
          results={smartSchedules}
          pageSize={3}
          createNewEvent={createNewEvent}
        />
      </div>
    </Container>
  );
};

const ResultPagination = ({ results, pageSize, createNewEvent }) => {
  const [currentPage, setCurrentPage] = useState(0);
  return (
    <div>
      <div className="flex flex-col gap-2">
        {results
          .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
          .map((schedule, i) => (
            <button
              className="flex text-sm"
              key={schedule || i}
              onClick={async () =>
                await createNewEvent(schedule[0], schedule[1])
              }
            >
              {dayjs(schedule[0]).format("YYYY-MM-DD HH:mm")}
              {"-"}
              {dayjs(schedule[1]).format("YYYY-MM-DD HH:mm")}
            </button>
          ))}
      </div>
      <div className="flex gap-2 border-t-1 border-black mt-2">
        <button onClick={() => setCurrentPage(currentPage - 1)}>prev</button>
        <button onClick={() => setCurrentPage(currentPage + 1)}>next</button>
      </div>
    </div>
  );
};

const EventHistoryPage = ({ eventHistory, setSteps, setEventHistory }) => {
  console.log(eventHistory);
  useEffect(() => {
    const fetchEventHistory = async () => {
      const res = await getStorageData("eventHistory");
      const { eventHistory } = res;
      if (eventHistory) {
        setEventHistory(eventHistory);
      }
    };
    fetchEventHistory();
  }, [setEventHistory]);
  return (
    <Container>
      {eventHistory
        .slice(0)
        .reverse()
        .map((eH, i) => (
          <HistoryCard
            summary={eH.summary}
            start={eH.start.dateTime}
            end={eH.end.dateTime}
            key={i}
          />
        ))}
      <Button onClick={() => setSteps(SmartSchedulerPages.TASKINFO)}>
        Back
      </Button>
    </Container>
  );
};

const HistoryCard = ({ summary, start, end }) => {
  console.log(start, end);

  return (
    <div className="shadow-md p-2">
      <div className="font-bold">{summary}</div>
      <div>{dayjs(start).format("YYYY-MM-DD HH:mm")}</div>
      <div>{dayjs(end).format("YYYY-MM-DD HH:mm")}</div>
    </div>
  );
};

const EntryWrapper = ({ children }) => (
  <div className="flex flex-col gap-2">{children}</div>
);

const DateWrapper = ({ children }) => (
  <div className="flex whitespace-nowrap gap-2">{children}</div>
);

const DayOfWeekButton = ({ children, selected, onClick }) => {
  return (
    <button
      className={`bg-gray-100 w-8 h-8 rounded-full border border-gray-300 ${
        selected ? "bg-blue-400" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default SmartScheduler;
