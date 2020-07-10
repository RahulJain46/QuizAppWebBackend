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
      if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.allresult != undefined &&
        query.allresult === "true"
      ) {
        db.collection("users")
          .aggregate([
            {
              $lookup: {
                from: "usersresponse",
                let: { id: "$userId" },
                pipeline: [
                  { $match: { date: query.date } },
                  {
                    $match: { $expr: { $in: ["$$id", "$usersAnswer.userId"] } }
                  },
                  { $unwind: "$usersAnswer" },
                  {
                    $match: { $expr: { $eq: ["$usersAnswer.userId", "$$id"] } }
                  }
                ],
                as: "userInfo"
              }
            },

            {
              $addFields: {
                size_of_info: { $size: "$userInfo" }
              }
            },
            { $match: { size_of_info: { $gt: 0 } } },

            {
              $project: {
                fullname: 1,
                city: 1,
                userId: 1,
                "userInfo.usersAnswer.score": 1,
                "userInfo.usersAnswer.time": 1,
                "userInfo.usersAnswer.suggestion": 1,
                "userInfo.usersAnswer.userId": 1
              }
            }
          ])
          .toArray(function(err, results) {
            if (err) throw err;
            let ObjArray = [];
            results.map(result => {
              let id = result.userId;
              let obj = {};
              if (result.userInfo.length != 0) {
                obj["time"] = result.userInfo[0].usersAnswer.time;
                obj["score"] = result.userInfo[0].usersAnswer.score;
                obj["feedback"] = result.userInfo[0].usersAnswer.feedback;
                obj["suggestion"] = result.userInfo[0].usersAnswer.suggestion;
                obj["fullname"] = result.fullname;
                obj["city"] = result.city;
                ObjArray.push(obj);
              }
            });
            res.json(ObjArray);
            db.close();
          });
      } else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.userresponse != undefined &&
        query.userId != undefined &&
        query.date != undefined &&
        query.userresponse === "true"
      ) {
        db.collection(userResponseCollection)
          .aggregate([
            {
              $match: {
                date: query.date
              }
            },
            {
              $project: {
                usersResponse: {
                  $filter: {
                    input: "$usersAnswer",
                    as: "useranswer",
                    cond: {
                      $eq: ["$$useranswer.userId", query.userId]
                    }
                  }
                }
              }
            }
          ])
          .toArray(function(err, results) {
            if (err) throw err;
            if (results[0].usersResponse.length) {
              res.json(results);
              db.close();
            } else {
              let obj = {};
              obj["loginResponse"] = false;
              res.json(obj);
              db.close();
            }
          });
      } else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.date != undefined &&
        query.userId != undefined
      ) {
        collection
          .find({ date: query.date, "usersAnswer.userId": query.userId })
          .count({}, function(err, results) {
            let resp = results;
            res.json(resp);
            db.close();
          });
      } else if (
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
  })
  .patch(function(req, res) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var usersResponse = req.body;

      var collection = db.collection(userResponseCollection);

      let query = req.query;
      if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.date != null &&
        query.date != undefined &&
        query.update === "true" &&
        query.update != undefined
      ) {
        collection.update(
          { date: query.date },
          { $push: { usersAnswer: usersResponse } },
          function(err, results) {
            console.log(results);
            res.send("update is successful " + results.result.ok);
            db.close();
          }
        );
      }
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
