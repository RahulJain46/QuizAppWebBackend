var express = require("express");
var userRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
require('dotenv').config();
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, usersCollections, databaseName } = require("../config");

/* GET users listing. */
const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const fullName = uri + dbName;

const connectionString = process.env.MONGODBURL

userRouter
  .route("/")
  .get(async function(req, res, next) {

    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    const collection = client.db('jindarshan').collection(usersCollections);
      var query = req.query;
      //user login and results in appeared quiz date for the specific users
      //endpoint- /users?login=true&userId=
      if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.login === "true" &&
        query.login != undefined &&
        query.userId != undefined
      ) {
        try {
          const usersResults = await collection.find({ userId: query.userId }).count();
          if (usersResults == 1) {
            const resultsDate = await client.db('jindarshan').collection("usersresponse")
              .find({ "usersAnswer.userId": query.userId }, { date: 1 }).toArray();
            res.json(resultsDate);
          } else {
            let obj = {};
            obj["loginResponse"] = false;
            res.json(obj);
          }
        } catch (err) {
          console.log(err);
          res.status(500).send("Error occurred");
        } finally {
          await client.close();
        }
      }
      //to check if the user exist or not by count for children
      //query- /?userId=
      else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.child === "true" &&
        query.userId != undefined
      ) {
        const results = await collection.find({ child: "true", userId: query.userId }).count();
        console.log(results);
        let resp = results;
        res.json(resp);
        await client.close();
      }
      //to check if the user exist or not by count
      //query- /?userId=
      else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.userId != undefined
      ) {
        const results = await collection.find({ userId: query.userId }).count();
        console.log(results);
        let resp = results;
        res.json(resp);
        await client.close();
      }
      //get all the users- general end point
      else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query
      ) {
        const results = await collection.find(query).toArray();
        let resp = results;
        res.json(resp);
        await client.close();
      } else {
        const results = await collection.find({}).toArray();
        let resp = results;
        res.json(resp);
        await client.close();
      }
  })
  .post(async function(req, res) {
      const client = await mongodb.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB');

      var ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
      var user = req.body;

      var currentTime = new Date();
      var currentOffset = currentTime.getTimezoneOffset();
      var ISTOffset = 330; // IST offset UTC +5:30
      var ISTTime = new Date(
        currentTime.getTime() + (ISTOffset + currentOffset) * 60000
      );
      var date = ISTTime.toString().substring(4, 24);

      const collection = client.db('jindarshan').collection(usersCollections);

      if (user.child == "true") {
        var id = uuidv5(
          user.fullname.toLowerCase() + user.mobile + "_child",
          uuidv5.DNS
        );
      } else {
        var id = uuidv5(user.fullname.toLowerCase() + user.mobile, uuidv5.DNS);
      }

      // let id = uuidv5(user.fullname.toLowerCase() + user.mobile, uuidv5.DNS);
      Object.assign(user, { userId: id, ip, date });



      const result = await collection.insertOne(user);
      console.log(result.insertedId);
      res.send(`Update is successful: ${result.insertedId}`);
      await client.close();
  });

module.exports = userRouter;
