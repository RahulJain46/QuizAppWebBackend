var express = require("express");
var kbcuserRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
require('dotenv').config();
const { ObjectId } = require('mongodb');
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, kbcUsersCollection, databaseName } = require("../config");

/* GET users listing. */
const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const fullName = uri + dbName;

const connectionString = process.env.MONGODBURL;

kbcuserRouter
  .route("/")
  .get(async function(req, res, next) {
    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    const collection = client.db('jindarshan').collection(kbcUsersCollection);
      var query = req.query;
      //user login and results in appeared quiz date for the specific users
      //endpoint- /users?login=true&userId=
      if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.login === "true" &&
        query.login != undefined &&
        query.userId != undefined
      ) {
        const usersResults = await collection.countDocuments({ userId: query.userId });

        if (usersResults === 1) {
          const resultsDate = await client.db('jindarshan').collection("usersresponse")
            .find({ "usersAnswer.userId": query.userId }, { date: 1 })
            .toArray();
          res.json(resultsDate);
        } else {
          const obj = { loginResponse: false };
          res.json(obj);
        }
        await client.close();
      }
      //to check if the user exist or not by count
      //query- /?userId=
      else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.userId != undefined
      ) {

        const results = await collection.countDocuments({ userId: query.userId });
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
        try {
          const results = await collection.find(query).toArray();
          let resp = results;
          res.json(resp);
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: true, message: err.message });
        }
        finally {
          if(client){
              await client.close()
          }
        }
      } else {

        const results = await collection.find({}).toArray();
        console.log(results);
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

      const collection = client.db('jindarshan').collection(kbcUsersCollection);
      let id = uuidv5(user.fullname.toLowerCase() + user.mobile, uuidv5.DNS);
      Object.assign(user, { userId: id, ip, date });
      const results = await collection.insertOne(user);
      console.log(results.insertedIds);
      res.send("update is successful " + results.insertedIds);
      await client.close()
  });

module.exports = kbcuserRouter;
