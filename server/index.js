const { processDocument } = require("./docai");
const express = require("express");
var bodyParser = require("body-parser");
require("dotenv").config();
let multer = require("multer");
let upload = multer();
const PORT = process.env.PORT || 3001;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.post("/processDoc", upload.single("file"), async (req, res) => {
  console.log(req.file);
  var fileName = req.file.originalname;
  const courseNameRegex = /[a-zA-Z]*.{0,1}([0-9]{2,3}|[0-9][a-zA-Z])/g;
  var courseNameArr = fileName.match(courseNameRegex);
  const courseNameStr = courseNameArr[0];
  console.log(courseNameStr);
  const eventjson = await processDocument(courseNameStr, req.file.buffer);
  res.json({
    message: "Hello from server!",
    courseName: courseNameStr,
    eventJson: eventjson,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
