var express = require("express");
var path = require("path");
//var favicon = require('serve-favicon');
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var cors = require("cors");

var index = require("./routes/index");
var users = require("./routes/users");
var usersResponse = require("./routes/usersResponse");
var questions = require("./routes/questions");

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
var corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "PUT", "POST", "PATCH"],
  allowedHeaders: "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.options("*", cors());
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, "public")));

app.all("/", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Content-Type", "application/json");
  res.header(
    "Access-Control-Allow-Headers",
    "origin,x-requested-with,Content-Type"
  );
  next();
});

app.use("/", cors(corsOptions), index);
app.use("/users", users);
app.use("/questions", cors(corsOptions), questions);
app.use("/usersresponse", usersResponse);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json("error");
});

module.exports = app;
