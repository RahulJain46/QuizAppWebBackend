var express = require("express");
var bhajanReactionsRoute = express.Router();
var mongodb = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var bodyParser = require("body-parser");
var uuidv5 = require("uuid").v5;
require('dotenv').config();
var {
  mongoDbUrl,
  bhajanReactionsCollection,
  databaseName
} = require("../config");

const connectionString = process.env.MONGODBURL

bhajanReactionsRoute
  .route("/")
  .get(function(req, res) {
    mongodb.connect(connectionString, function(err, client) {
      if (err) {
        console.log(err);
        return;
      }
      const db = client.db('jindarshan');
      var collection = db.collection(bhajanReactionsCollection);
      collection.find({}).toArray(function(err, results) {
        console.log(results);
        let resp = results;
        res.json(resp);
        client.close();
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

      var collection = db.collection(bhajanReactionsCollection);
      Object.assign(comment);
      collection.insert(comment, function(err, results) {
        console.log(results.insertedIds);
        res.send("update is successful " + results.insertedIds);
        db.close();
      });
    });
  });

module.exports = bhajanReactionsRoute;
