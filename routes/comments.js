var express = require("express");
var commentsRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var bodyParser = require("body-parser");
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, commentsCollections, databaseName } = require("../config");

const connectionString = mongoDbUrl + databaseName;

commentsRouter
  .route("/")
  .get(function(req, res) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(commentsCollections);
      collection.find({}).toArray(function(err, results) {
        console.log(results);
        let resp = results;
        res.json(resp);
        db.close();
      });
    });
  })
  .post(function(req, res) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var comment = req.body;
      var currentTime = new Date();
      var currentOffset = currentTime.getTimezoneOffset();
      var ISTOffset = 330; // IST offset UTC +5:30
      var ISTTime = new Date(
        currentTime.getTime() + (ISTOffset + currentOffset) * 60000
      );
      var date = ISTTime.toString().substring(4, 24);
      var browser = req.headers["user-agent"];
      var collection = db.collection(commentsCollections);
      Object.assign(comment, { date, browser });
      collection.insert(comment, function(err, results) {
        console.log(results.insertedIds);
        res.send("update is successful " + results.insertedIds);
        db.close();
      });
    });
  });

module.exports = commentsRouter;
