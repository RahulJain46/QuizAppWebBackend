var express = require("express");
var kbcuserRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var bodyParser = require("body-parser");
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, kbcUsersCollection, databaseName } = require("../config");

/* GET users listing. */
const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const fullName = uri + dbName;

const connectionString = mongoDbUrl + databaseName;

kbcuserRouter
  .route("/")
  .get(function(req, res, next) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(kbcUsersCollection);
      var query = req.query;
      //user login and results in appeared quiz date for the specific users
      //endpoint- /users?login=true&userId=
      if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.login === "true" &&
        query.login != undefined &&
        query.userId != undefined
      ) {
        collection
          .find({ userId: query.userId })
          .count({}, function(err, usersResults) {
            if (usersResults == 1) {
              db.collection("usersresponse")
                .find({ "usersAnswer.userId": query.userId }, { date: 1 })
                .toArray(function(err, resultsDate) {
                  res.json(resultsDate);
                  db.close();
                });
            } else {
              let obj = {};
              obj["loginResponse"] = false;
              res.json(obj);
              db.close();
            }
          });
      }
      //to check if the user exist or not by count
      //query- /?userId=
      else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.userId != undefined
      ) {
        collection
          .find({ userId: query.userId })
          .count({}, function(err, results) {
            console.log(results);
            let resp = results;
            res.json(resp);
            db.close();
          });
      }
      //get all the users- general end point
      else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query
      ) {
        collection.find(query).toArray(function(err, results) {
          let resp = results;
          res.json(resp);
          db.close();
        });
      } else {
        collection.find({}).toArray(function(err, results) {
          let resp = results;
          res.json(resp);
          db.close();
        });
      }
    });
  })
  .post(function(req, res) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }

      var ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
      var user = req.body;

      var currentTime = new Date();
      var currentOffset = currentTime.getTimezoneOffset();
      var ISTOffset = 330; // IST offset UTC +5:30
      var ISTTime = new Date(
        currentTime.getTime() + (ISTOffset + currentOffset) * 60000
      );
      var date = ISTTime.toString().substring(4, 24);

      var collection = db.collection(kbcUsersCollection);
      let id = uuidv5(user.fullname.toLowerCase() + user.mobile, uuidv5.DNS);
      Object.assign(user, { userId: id, ip, date });
      collection.insert(user, function(err, results) {
        console.log(results.insertedIds);
        res.send("update is successful " + results.insertedIds);
        db.close();
      });
    });
  });

module.exports = kbcuserRouter;
