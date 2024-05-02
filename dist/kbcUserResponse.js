var express = require("express");
var kbcUserReponseRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
require('dotenv').config();
const { ObjectId } = require('mongodb');
var {
  mongoDbUrl,
  kbcUserResponseCollection,
  databaseName
} = require("../config");

const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const connectionString = process.env.MONGODBURL + process.env.DATABASENAME;
/* GET users listing. */
kbcUserReponseRouter
  .route("/")
  .get(async function(req, res, next) {

    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    
      var collection = client.db('jindarshan').collection(kbcUserResponseCollection);
      var query = req.query;
      if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.allresult != undefined &&
        query.allresult === "true"
      ) {
        const results = await client.db('jindarshan').collection("users").aggregate([
          {
            $lookup: {
              from: "usersresponse",
              let: { user_Id: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$date", query.date] },
                        { $in: ["$$user_Id", "$usersAnswer.userId"] },
                      ],
                    },
                  },
                },
                {
                  $project: {
                    "usersAnswer.userId": 1,
                    "usersAnswer.score": 1,
                    "usersAnswer.time": 1,
                    "usersAnswer.feedback": 1,
                    "usersAnswer.suggestion": 1,
                    date: 1,
                  },
                },
              ],
              as: "userInfo",
            },
          },
        ]).toArray();
        
        let ObjArray = [];
        results.forEach((result) => {
          let id = result.userId;
          let obj = {};
          if (result.userInfo.length != 0) {
            result.userInfo[0].usersAnswer.forEach((useranswer) => {
              if (useranswer.userId === id) {
                obj["time"] = useranswer.time;
                obj["score"] = useranswer.score;
                obj["feedback"] = useranswer.feedback;
                obj["suggestion"] = useranswer.suggestion;
              }
            });
            obj["fullname"] = result.fullname;
            obj["city"] = result.city;
            ObjArray.push(obj);
          }
        });
        res.json(ObjArray);
        await client.close();
      } else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.userresponse != undefined &&
        query.userId != undefined &&
        query.date != undefined &&
        query.userresponse === "true"
      ) {
        const results = await collection.aggregate([
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
        ]).toArray();
      
        if (results[0].usersResponse.length) {
          res.json(results);
        } else {
          let obj = {};
          obj["loginResponse"] = false;
          res.json(obj);
        }
       await client.close();
      } else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.date != undefined &&
        query.userId != undefined
      ) {
        const results = await collection.find({ date: query.date, "usersAnswer.userId": query.userId }).count();
        res.json(results);
        await client.close();
      } else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query
      ) {
        const results = await collection.find(query).toArray();
        res.json(results);
        await client.close();
      } else {
        const results = await collection.find({}).toArray();
        res.json(results);
        await client.close();
      }
  })
  .post(async function(req, res) {
    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
      var usersResponse = req.body;
      const collection = client.db('jindarshan').collection(kbcUserResponseCollection);
      const userResponseResult =  await collection.insertOne(usersResponse)
      console.log(userResponseResult.insertedId.toHexString());
      res.send("update is successful " + userResponseResult.insertedId.toHexString());
      await client.close();
  })
  .patch(async function(req, res) {
    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      w: 'majority'
    });
    console.log('Connected to MongoDB');

      var usersResponse = req.body;
      const collection = client.db('jindarshan').collection(kbcUserResponseCollection);
      let query = req.query;
      if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.date != null &&
        query.date != undefined &&
        query.update === "true" &&
        query.update != undefined
      ) {
       const results =  await collection.updateOne( { date: query.date },{ $push: { usersAnswer: usersResponse }});
       res.send("update is successful ");
       await client.close();
      }
  });

kbcUserReponseRouter
  .route("/:id")
  .get(async function(req, res) {
    var Id = new ObjectId(req.params.id);

    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const collection = client.db('jindarshan').collection(kbcUserResponseCollection);
    const results = await collection.find({ _id: Id }).toArray();
    console.log(results);
    let resp = results;
    res.json(resp);
    await client.close();
  })

  //delete method
  .delete(async function(req, res) {


    let client;
    try {
      var Id = new ObjectId(req.params.id);

       client = await mongodb.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      const collection = client.db('jindarshan').collection(kbcUserResponseCollection);
      await collection.deleteOne({ _id: Id });
      res.send("removed");
    } catch(err){
       console.error(err)
       res.status(500).json({ error: true, message: err.message });
    }
    finally {
      if(client){
          await client.close()
      }
    }
  });

module.exports = kbcUserReponseRouter;
