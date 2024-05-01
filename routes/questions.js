var express = require("express");
var questionsRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
require("dotenv").config();
const { ObjectId } = require("mongodb");
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, questionsCollection, databaseName } = require("../config");

const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const fullName = uri + dbName;
const connectionString =
  "mongodb://dbuser:password%40123@cluster0-shard-00-00-qqpkg.mongodb.net:27017,cluster0-shard-00-01-qqpkg.mongodb.net:27017,cluster0-shard-00-02-qqpkg.mongodb.net:27017/jindarshan?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
//const connectionString = process.env.MONGODBURL
console.log(connectionString, "connection string");
questionsRouter
  .route("/")
  .get(async function (req, res) {
    //const client = new MongoClient(uri, { useNewUrlParser: true });
    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    const collection = client.db("jindarshan").collection(questionsCollection);
    // var collection = db.collection(questionsCollection);
    var query = req.query;
    var paginationQuery = {};
    var pageNo = parseInt(req.query.pageNo);
    var size = parseInt(req.query.size);
    //get all the questions for all the dates
    paginationQuery.skip = size * (pageNo - 1);
    paginationQuery.limit = size;
    paginationQuery.sort = { _id: 1 };

    if (
      !(Object.keys(query).length === 0 && query.constructor === Object) &&
      query.date != undefined &&
      query.date[1] === "all"
    ) {
      const results = await collection.find({}, { date: 1 }).toArray();
      console.log(results);
      let resp = results;
      res.json(resp);
      await client.close();
    } else if (pageNo && size) {
      collection.count({}, function (err, totalCount) {
        collection
          .find({}, {}, paginationQuery)
          .toArray(function (err, results) {
            var totalPages = Math.ceil(totalCount / size);
            response = { error: false, message: results, pages: totalPages };
            res.json(results);
            client.close();
          });
      });
    } else if (
      query &&
      !(Object.keys(query).length === 0 && query.constructor === Object)
    ) {
      const results = await collection.findOne(query);
      console.log(results);
      let resp = results;
      res.json(resp);
      await client.close();
    } else {
      const results = await collection.find({}).toArray();
      console.log(results);
      let resp = results;
      res.json(resp);
      await client.close();
    }
  })
  .post(async function (req, res) {
    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    var questions = req.body;
    questions.questions.map((question) => {
      let id = uuidv5(question.question, uuidv5.DNS);
      Object.assign(question, { _id: id });
    });
    console.log(questions);
    const collection = client.db("jindarshan").collection(questionsCollection);
    await collection.insertOne(questions);
    const userResponse = {
      date: questions.date,
      usersAnswer: [],
    };
    const kbcUserResponse = {
      date: questions.date,
      usersAnswer: [],
    };
    const kbcusersresponseCollection = client
      .db("jindarshan")
      .collection("kbcusersresponse");
    const usersresponseCollection = client
      .db("jindarshan")
      .collection("usersresponse");
    await kbcusersresponseCollection.insertOne(kbcUserResponse);
    const userResponseResult = await usersresponseCollection.insertOne(
      userResponse
    );
    console.log(userResponseResult.insertedId.toHexString());
    res.send(
      "update is successful " + userResponseResult.insertedId.toHexString()
    );
    await client.close();
  });

questionsRouter
  .route("/:id")
  .get(async function (req, res) {
    console.log(ObjectId);
    var Id = new ObjectId(req.params.id);

    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const collection = client.db("jindarshan").collection(questionsCollection);
    const results = await collection.find({ _id: Id }).toArray();
    console.log(results);
    let resp = results;
    res.json(resp);
    await client.close();
  })
  //put method to edit
  .put(async function (req, res) {
    var Id = new ObjectI(req.params.id);
    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    var reqBody = req.body;
    const collection = client.db("jindarshan").collection(questionsCollection);
    await collection.updateOne({ _id: Id }, { $set: reqBody });
    res.send("updated");
    await client.close();
  })
  //delete method
  .delete(async function (req, res) {
    let client;
    try {
      var Id = new ObjectId(req.params.id);

      client = await mongodb.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      var reqBody = req.body;
      const collection = client
        .db("jindarshan")
        .collection(questionsCollection);
      await collection.deleteOne({ _id: Id }, { $set: reqBody });
      res.send("removed");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true, message: err.message });
    } finally {
      if (client) {
        await client.close();
      }
    }
  });

module.exports = questionsRouter;
