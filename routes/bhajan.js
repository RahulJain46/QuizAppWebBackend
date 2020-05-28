var express = require("express");
var bhajanRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var bodyParser = require("body-parser");
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, bhajanCollection, databaseName } = require("../config");

const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const fullName = uri + dbName;
const url1 =
  "mongodb://dbuser:password%40123@cluster0-shard-00-00-qqpkg.mongodb.net:27017,cluster0-shard-00-01-qqpkg.mongodb.net:27017,cluster0-shard-00-02-qqpkg.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

const connectionString = mongoDbUrl + databaseName;

bhajanRouter
  .route("/")
  .get(function(req, res) {
    //const client = new MongoClient(uri, { useNewUrlParser: true });
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(bhajanCollection);
      var query = req.query;
      //get all the questions for all the dates
      
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
      var bhajans = req.body;
      var collection = db.collection(bhajanCollection);
      collection.insert(bhajans, function(err, results) {
        console.log(results.insertedIds);
        res.send("update is successful " + results.insertedIds);
        db.close();
      });
        
     
    });
  });

bhajanRouter
  .route("/:id")
  .get(function(req, res) {
    var Id = new objectId(req.params.id);
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(bhajanCollection);
      //get the result by searching with id
      collection.findOne({ _id: Id }, function(err, results) {
        res.json(results);
        db.close();
      });
    });
  })
  //put method to edit
  .put(function(req, res) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(bhajanCollection);
      var fort = req.body;

      collection.update({ _id: Id }, { $set: fort }, function(err, result) {
        if (err) {
          throw err;
        }
        res.send("updated");
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
      var collection = db.collection(bhajanCollection);

      collection.deleteOne({ _id: Id }, function(err, results) {
        res.send("removed");
        db.close();
      });
    });
  });

module.exports = bhajanRouter;
