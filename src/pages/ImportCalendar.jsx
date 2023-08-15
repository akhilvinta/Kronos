/*global chrome*/
import React, { useState, useEffect } from "react";
import Header from "./../components/Header";
import { BlackButton } from "./../components/Button";
import Container from "./../components/Container";
import { importIcalIntoGcal } from "../services/iCalService";
import CircularProgress from "./../components/CircularProgress";

const ImportCalendar = ({ pageCallback }) => {
  const [isImportClicked, setIsImportClicked] = useState(false);
  const [status, setStatus] = useState("In Progress ...");
  const [pageUrl, setPageUrl] = useState("Not set");

  useEffect(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      setPageUrl(tabs[0].url);
    });
  });

  const handleImport = async () => {
    setIsImportClicked(true);
    setStatus("In Progress ...");
    try {
      let result = await importIcalIntoGcal(); // Whatever helper_resolve_callback resolves to.
      setStatus(result);
    } catch (err) {
      console.log(err);
    }
  };

  // element
  /*
      <a id="ctl00_customSideContents_calDlTerm" class="courseLink" href="/Calendar/caldl.aspx?t=ct&amp;term=22F" target="_blank"><span class="icon-download-alt"></span> Download Fall 2022 calendar data</a>
      */

  // https://be.my.ucla.edu/Calendar/caldl.aspx?t=ct&term=22F

  return (
    <div>
      <Header
        text={"Import to Google Calendar"}
        buttonCallback={pageCallback}
      />
      <Container>
        <div>
          {pageUrl === "https://be.my.ucla.edu/studylist.aspx" ? (
            <div>You're on the right page. Click Import to proceed.</div>
          ) : (
            <div>
              Wrong page. Navigate to Classes &gt; Study List or click{" "}
              <a
                href="/#"
                className="text-blue-300 hover:cursor-pointer"
                onClick={() =>
                  chrome.tabs.update({
                    url: "https://be.my.ucla.edu/studylist.aspx",
                  })
                }
              >
                here
              </a>
              .
            </div>
          )}
        </div>
        <div>
          {isImportClicked && status === "In Progress ..." ? (
            <div className="flex gap-2">
              <CircularProgress />
              <div>Importing ...</div>
            </div>
          ) : isImportClicked ? (
            status
          ) : null}
          <BlackButton onClick={handleImport}>Import</BlackButton>
        </div>
      </Container>
    </div>
  );
};

export default ImportCalendar;

/*
- testNoIcalFound: This test calls the API in a manipulated environment where the .ics file
is unexpectedly not found on the MyUCLA website. The API should handle this
gracefully, by requesting that the user make sure they are on the right page. If the user is
already on the right page, it should display that the file could not be found.
- testHappyPath: This test compares a mock calendar before and after the extension has
processed a mock .ics file. The API should insert the correct events into the calendar.
The values of the mock calendar and mock .ics file both are known to us, so we can
confirm that this was indeed the case.
- testRenewImport: This should remove the previous import leaving no artifacts (with the
user’s consent) and replace it with the superseding iCal. The mock calendar should be
as if the previous import never happened.
*/
