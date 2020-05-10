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

var whitelist = ["https://newfrontendweb.herokuapp.com/"];
var corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

//app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.all("/", function(req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://newfrontendweb.herokuapp.com/"
  );
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
  req.header(
    "Access-Control-Allow-Origin",
    "https://newfrontendweb.herokuapp.com/"
  );
  req.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  req.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
  next();
});

app.use("/", index);
app.use("/users", users);
app.use("/questions", questions);
app.use("/usersresponse", usersResponse);

app.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://newfrontendweb.herokuapp.com/"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  next();
});

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
