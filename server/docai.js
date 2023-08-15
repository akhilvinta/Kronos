const projectId = "kronos-365404";
const location = "us"; // Format is 'us' or 'eu'
const processorId = "fe89b1d5d1d878cd"; // Create processor in Cloud Console
const filePath =
  "/Users/mengrandai/Library/CloudStorage/OneDrive-Personal/Fall2022/kronos/Kronos-backend/server/Mengran Dai Graduate Application.pdf";
require("dotenv").config();
const { DocumentProcessorServiceClient } = require("@google-cloud/documentai");

// Instantiates a client
const client = new DocumentProcessorServiceClient();
var eventKeyword = [
  "Final",
  "final",
  "Midterm",
  "midterm",
  "Project",
  "project",
];

const MonthToNum = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
  January: "01",
  Febuary: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  Septemober: "09",
  October: "10",
  November: "11",
  December: "12",
};

const dateRegex =
  /(Jan(uary)?|Feb(ruary)?|Mar(ch)?|Apr(il)?|May|Jun(e)?|Jul(y)?|Aug(ust)?|Sep(tember)?|Oct(ober)?|Nov(ember)?|Dec(ember)?)\s+\d{1,2}/gi;
const timeRegex =
  /(2[0-3](:[0-5][0-9]){0,1}|[01]\d(:[0-5][0-9]){0,1}|\d(:[0-5][0-9]){0,1})(am|pm){0,1}-(2[0-3](:[0-5][0-9]){0,1}|[01]\d(:[0-5][0-9]){0,1}|\d(:[0-5][0-9]){0,1})(am|pm){0,1}/gi;

var processDocument = (exports.processDocument = async function (
  courseName,
  inputFile
) {
  var eventJson = [];
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  const request = {
    name,
    rawDocument: {
      content: inputFile,
      mimeType: "application/pdf",
    },
  };

  // Recognizes text entities in the PDF document
  const [result] = await client.processDocument(request);

  console.log("Document processing complete.");

  // Read the text recognition output from the processor
  // For a full list of Document object attributes,
  // please reference this page: https://googleapis.dev/nodejs/documentai/latest/index.html
  const { document } = result;
  console.log(document);
  const { text } = document;

  // Read the text recognition output from the processor
  console.log(`Full document text: ${JSON.stringify(text)}`);
  console.log(`There are ${document.pages.length} page(s) in this document.`);
  for (const page of document.pages) {
    console.log(`Page ${page.pageNumber}`);
    processLines(page.lines, text, courseName, eventJson);
  }
  return eventJson;
});

const printPageDimensions = (dimension) => {
  console.log(`    Width: ${dimension.width}`);
  console.log(`    Height: ${dimension.height}`);
};

const printDetectedLanguages = (detectedLanguages) => {
  console.log("    Detected languages:");
  for (const lang of detectedLanguages) {
    const code = lang.languageCode;
    const confPercent = lang.confidence * 100;
    console.log(`        ${code} (${confPercent.toFixed(2)}% confidence)`);
  }
};

const printParagraphs = (paragraphs, text) => {
  console.log(`    ${paragraphs.length} paragraphs detected:`);
  const firstParagraphText = getText(paragraphs[0].layout.textAnchor, text);
  console.log(
    `        First paragraph text: ${JSON.stringify(firstParagraphText)}`
  );
  const lastParagraphText = getText(
    paragraphs[paragraphs.length - 1].layout.textAnchor,
    text
  );
  console.log(
    `        Last paragraph text: ${JSON.stringify(lastParagraphText)}`
  );
};

const printBlocks = (blocks, text) => {
  console.log(`    ${blocks.length} blocks detected:`);
  for (const block of blocks) {
    const blockText = getText(block.layout.textAnchor, text);
    console.log(`block text: ${blockText}`);
  }
};

const printLines = (lines, text) => {
  console.log(`    ${lines.length} lines detected:`);
  for (const line of lines) {
    const lineText = getText(line.layout.textAnchor, text);
    console.log(`line text: ${lineText}`);
  }
};

var generateEventJson = (exports.generateEventJson = function (
  courseName,
  eventName,
  dateStr,
  timeStr
) {
  date = parseDate(dateStr);
  var startJson, endJson;
  if (timeStr !== "null" && timeStr.length > 0) {
    const [startTime, endTime] = parseTime(timeStr);
    startJson = {
      dateTime: date + "T" + startTime,
      timeZone: "America/Los_Angeles",
    };
    endJson = {
      dateTime: date + "T" + endTime,
      timeZone: "America/Los_Angeles",
    };
  } else {
    startJson = {
      date: date,
      timeZone: "America/Los_Angeles",
    };
    endJson = {
      date: date,
      timeZone: "America/Los_Angeles",
    };
  }
  return {
    summary: courseName + " " + eventName,
    //location: "Perloff",
    //description: "A chance to hear more about Google's developer products.",
    start: startJson,
    end: endJson,
    recurrence: [],
    attendees: [],
  };
});

// input: 6pm or 6:00pm
// output: 18:00:00
// input: 3
// output: 15:00:00 (because 3am does not make sense)
var convertTime = (exports.convertTime = function (startTimeStr, endTimeStr) {
  var startTimeArr = startTimeStr.split(":");
  var endTimeArr = endTimeStr.split(":");
  console.log(startTimeArr);
  console.log(endTimeArr);
  var StartMeridiem = "pm";
  var endMeridiem = "pm";
  for (var i = 0; i < startTimeArr.length; i += 1) {
    if (startTimeArr[i].includes("am")) {
      StartMeridiem = "am";
    }
    startTimeArr[i] = startTimeArr[i].replace("am", "");
    startTimeArr[i] = startTimeArr[i].replace("pm", "");
  }
  for (var i = 0; i < endTimeArr.length; i += 1) {
    if (endTimeArr[i].includes("am")) {
      endMeridiem = "am";
    }
    endTimeArr[i] = endTimeArr[i].replace("am", "");
    endTimeArr[i] = endTimeArr[i].replace("pm", "");
  }
  var startHour = parseInt(startTimeArr[0]);
  var endHour = parseInt(endTimeArr[0]);
  if (endMeridiem == "am") {
    StartMeridiem = "am";
  }
  if (endMeridiem == "pm" && startHour > endHour) {
    StartMeridiem = "am";
  }

  console.log(StartMeridiem, endMeridiem);

  if (StartMeridiem == "pm") {
    startHour = (startHour % 12) + 12;
  }
  if (endMeridiem == "pm") {
    endHour = (endHour % 12) + 12;
  }

  startTimeArr[0] = String(startHour);
  endTimeArr[0] = String(endHour);
  while (startTimeArr.length < 3) {
    startTimeArr.push("00");
  }
  while (endTimeArr.length < 3) {
    endTimeArr.push("00");
  }
  console.log(startTimeArr, endTimeArr);
  return [startTimeArr.join(":"), endTimeArr.join(":")];
});

var parseTime = (exports.parseTime = function (timeStr) {
  console.log(`parsing timestr ${timeStr}`);
  let startTimeStr, endTimeStr;
  [startTimeStr, endTimeStr] = timeStr.split("-");
  [startTimeStr, endTimeStr] = convertTime(startTimeStr, endTimeStr);
  console.log(startTimeStr, endTimeStr);
  return [startTimeStr, endTimeStr];
});

var parseDate = (exports.parseDate = function (dateStr) {
  console.log(`parsing datestr ${dateStr}`);
  console.log(dateStr);
  let monthStr, dayStr;
  [monthStr, dayStr] = dateStr.split(" ");
  yearStr = "2022";
  monthStr = MonthToNum[monthStr];
  //date = "2022-12-20";
  if (dayStr.length == 1) {
    dayStr = "0" + dayStr;
  }
  date = yearStr + "-" + monthStr + "-" + dayStr;
  console.log(`date is ${date}`);
  return date;
});

var processLines = (exports.proecssLines = function (
  lines,
  text,
  courseName,
  eventJson
) {
  //console.log(getText(lines[0].layout.textAnchor, text));
  for (var j = 0; j < lines.length - 1; j++) {
    const lineText =
      getText(lines[j].layout.textAnchor, text) +
      " " +
      getText(lines[j + 1].layout.textAnchor, text);
    const [dateStr, timeStr, eventName] = processLine(lineText);
    if (dateStr !== "null") {
      if (dateStr.length > 0) {
        console.log(`line text: ${lineText}`);
        console.log(
          `Create EventJson: token is ${token}, keywork is ${keyword}, dateStr is ${dateStr}, timeStr is ${timeStr}`
        );
        eventJson.push(
          generateEventJson(courseName, eventName, dateStr, timeStr)
        );
      }
    }
  }
});

var processLine = (exports.processLine = function (lineText) {
  console.log(`line text: ${lineText}`);
  tokens = lineText.split(" ");
  var dateStr = null;
  var timeStr = null;
  var eventName = null;
  for (var i = 0; i < tokens.length; i++) {
    token = tokens[i];
    length = eventKeyword.length;
    while (length--) {
      keyword = eventKeyword[length];
      if (token.includes(keyword)) {
        eventName = keyword;
        dateStr = String(lineText.match(dateRegex));
        timeStr = String(lineText.match(timeRegex));
        return [dateStr, timeStr, eventName];
      }
    }
  }
  return [String(dateStr), String(timeStr), String(eventName)];
});

const printTokens = (tokens, text) => {
  for (const token of tokens) {
    const tokenText = getText(token.layout.textAnchor, text);
    console.log(`token text: ${tokenText}`);
  }
};

// Extract shards from the text field
const getText = (textAnchor, text) => {
  if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
    return "";
  }

  // First shard in document doesn't have startIndex property
  const startIndex = textAnchor.textSegments[0].startIndex || 0;
  const endIndex = textAnchor.textSegments[0].endIndex;

  return text.substring(startIndex, endIndex);
};

exports.testhelper = function testhelper() {
  console.log("testhelper");
  return "testhelper";
};
