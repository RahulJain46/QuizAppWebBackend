var express = require("express");
var userRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var bodyParser = require("body-parser");
var uuidv5 = require("uuid").v5;

/* GET users listing. */
const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const fullName = uri + dbName;

userRouter
  .route("/")
  .get(function(req, res, next) {
    mongodb.connect(fullName, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection("users");
      var query = req.query;
      if (query) {
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
    mongodb.connect(fullName, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var user = req.body;
      var collection = db.collection("users");
      collection.insert(user, function(err, results) {
        console.log(results.insertedIds);
        res.send("update is successful " + results.insertedIds);
        db.close();
      });
    });
  });

module.exports = userRouter;
