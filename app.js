var express = require("express");
var path = require("path");
//var favicon = require('serve-favicon');
var logger = require("morgan");
var mongodb = require("mongodb").MongoClient;
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, questionsCollection, databaseName } = require("./config");

const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";

const connectionString = mongoDbUrl + databaseName;
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var cors = require("cors");

var app = express();
app.use(cors());

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

require("./routes/index.js")(app);
var users = require("./routes/users");
var usersResponse = require("./routes/usersResponse");
//require("./routes/questions.js")(app);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(path.join(__dirname, "public")));

//app.use("/", cors(), index);
app.use("/users", users);
//app.use("/questions", cors(), questions, cors());
app.use("/usersresponse", usersResponse);

app.get("/simple-cors", (req, res) => {
  console.info("GET /simple-cors");
  res.json({
    text: "Simple CORS requests are working. [GET]"
  });
});

app.get("/questions", cors(), (req, res) => {
  //const client = new MongoClient(uri, { useNewUrlParser: true });
  mongodb.connect(connectionString, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var collection = db.collection(questionsCollection);
    var query = req.query;
    if (
      !(Object.keys(query).length === 0 && query.constructor === Object) &&
      query.date != undefined &&
      query.date[1] === "all"
    ) {
      collection.find({}, { date: 1 }).toArray(function(err, results) {
        console.log(results);
        let resp = results;
        res.send(resp);
        // res.json(resp);
        db.close();
      });
    } else if (
      !(Object.keys(query).length === 0 && query.constructor === Object) &&
      query.allresult === "true"
    ) {
      db.collection("usersresponse")
        .aggregate([
          {
            $lookup: {
              from: "users",
              let: { userId: "usersAnswer.userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$userId", "$$userId"]
                    }
                  }
                },
                {
                  $project: {
                    // "usersAnswer.answers": 1,
                    // "usersAnswer.comment": 1
                  }
                }
              ],

              as: "test"
            }
          }
        ])
        .toArray(function(err, results) {
          if (err) throw err;
          res.json(results);
          db.close();
        });
    } else if (
      query &&
      !(Object.keys(query).length === 0 && query.constructor === Object)
    ) {
      collection.find(query).toArray(function(err, results) {
        console.log(results);
        let resp = results;
        res.json(resp);
        db.close();
      });
    } else {
      collection.find({}).toArray(function(err, results) {
        console.log(results);
        let resp = results;
        res.json(resp);
        db.close();
      });
    }
  });
});
//require("./routes/questions.js")(app);

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
