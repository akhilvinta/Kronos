import * as SyllabusService from "../SyllabusService";
import user from "@testing-library/user-event";
import { render, waitFor } from "@testing-library/react";
import { UploadSyllabus } from "../../pages/UploadSyllabus";
import axios from "axios";
axios.defaults.adapter = require("axios/lib/adapters/http");
const courseNameRegex = /[a-zA-Z]*.{0,1}([0-9]{2,3}|[0-9][a-zA-Z])/g;
const mock_eventJson = [
  {
    summary: "eng 110 Final",
    start: {
      dateTime: "2022-12-06T8:00:00",
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: "2022-12-06T11:00:00",
      timeZone: "America/Los_Angeles",
    },
    recurrence: [],
    attendees: [],
  },
  {
    summary: "eng 110 Project",
    start: {
      date: "2022-12-10",
      timeZone: "America/Los_Angeles",
    },
    end: {
      date: "2022-12-10",
      timeZone: "America/Los_Angeles",
    },
    recurrence: [],
    attendees: [],
  },
];
describe("process syllabus ", () => {
  var selectedFile;
  var str;
  var file_data;

  it("parse course name in correct format", async () => {
    const spy = jest.spyOn(SyllabusService, "processSyllabus");
    spy.mockImplementation((file) => mock_eventJson);
    const eventJsons = await SyllabusService.processSyllabus(null);
    for (var i = 0; i < eventJsons.length; i = i + 1) {
      console.log(eventJsons[i]);
      const summary = eventJsons[i].summary;
      const courseNameArr = summary.match(courseNameRegex);
      expect(courseNameArr.length).toBeGreaterThan(0);
    }
  });
});
