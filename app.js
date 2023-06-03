var express = require("express");
var path = require("path");
//var favicon = require('serve-favicon');
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var cors = require("cors");

var index = require("./routes/index");
var users = require("./routes/users");
var kbcUsers = require("./routes/kbcUsers");
var usersResponse = require("./routes/usersResponse");
var kbcUserResponse = require("./routes/kbcUserResponse");
var questions = require("./routes/questions");
var comments = require("./routes/comments");
var bhajan = require("./routes/bhajan");
var bhajanReactions = require("./routes/bhajanReactions");

var examusers = require("./routes/examusers");
var examusersResponse = require("./routes/examusersResponse");
var examquestions = require("./routes/examquestions");

var childrenusersResponse = require("./routes/childrenusersResponse");
var childrenquestions = require("./routes/childrenquestions");
var uploadImages = require("./routes/uploadImages");
const dotenv = require('dotenv');


var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);
app.use("/users", users);
app.use("/kbcusers", kbcUsers);
app.use("/questions", questions);
app.use("/usersresponse", usersResponse);
app.use("/kbcusersresponse", kbcUserResponse);
app.use("/comments", comments);
app.use("/bhajan", bhajan);
app.use("/bhajanreactions", bhajanReactions);

app.use("/examusers", examusers);
app.use("/examquestions", examquestions);
app.use("/examusersresponse", examusersResponse);

app.use("/childrenusersresponse", childrenusersResponse);
app.use("/childrenquestions", childrenquestions);
app.use("/upload", uploadImages);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(function(req,res,next) {
  dotenv.config();
  next();
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json("error");
});

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

module.exports = app;
