var express = require("express");
var userReponseRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var bodyParser = require("body-parser");
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, userResponseCollection, databaseName } = require("../config");

const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const connectionString = mongoDbUrl + databaseName;
/* GET users listing. */
userReponseRouter
  .route("/")
  .get(function(req, res, next) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(userResponseCollection);
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
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var usersResponse = req.body;
      usersResponse.usersAnswer.map(userAnswer => {
        userAnswer.answers.map(answer => {
          let id = uuidv5(answer.question, uuidv5.DNS);
          Object.assign(answer, { _id: id });
        });
      });
      var collection = db.collection(userResponseCollection);
      collection.insert(usersResponse, function(err, results) {
        console.log(results.insertedIds);
        res.send("update is successful " + results.insertedIds);
        db.close();
      });
    });
  });

userReponseRouter
  .route("/:id")
  .get(function(req, res) {
    var Id = new objectId(req.params.id);
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(userResponseCollection);
      collection.findOne({ _id: Id }, function(err, results) {
        res.json(results);
        db.close();
      });
    });
  })

  //delete method
  .delete(function(req, res) {
    var Id = new objectId(req.params.id);
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(userResponseCollection);

      collection.deleteOne({ _id: Id }, function(err, results) {
        res.send("removed");
        db.close();
      });
    });
  });

module.exports = userReponseRouter;
