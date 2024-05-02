var express = require("express");
var userReponseRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
require('dotenv').config();
const { ObjectId } = require('mongodb');
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, userResponseCollection, databaseName } = require("../config");

const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const connectionString = process.env.MONGODBURL
/* GET users listing. */
userReponseRouter
  .route("/")
  .get(async function(req, res, next) {
      const client = await mongodb.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB');
      const collection = client.db('jindarshan').collection(userResponseCollection);
      var query = req.query;
      if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.allresult != undefined &&
        query.allresult === "true"
      ) {

        const results = await  client.db('jindarshan').collection("users").aggregate([
          {
            $lookup: {
              from: "usersresponse",
              let: { id: "$userId" },
              pipeline: [
                { $match: { date: query.date } },
                { $match: { $expr: { $in: ["$$id", "$usersAnswer.userId"] } } },
                { $unwind: "$usersAnswer" },
                { $match: { $expr: { $eq: ["$usersAnswer.userId", "$$id"] } } }
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
              "userInfo.usersAnswer.feedback": 1,
              "userInfo.usersAnswer.suggestion": 1,
              "userInfo.usersAnswer.userId": 1
            }
          }
        ]).toArray();
      
        let ObjArray = [];
        results.forEach(result => {
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
        await client.close()
      } else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.userresponse != undefined &&
        query.userId != undefined &&
        query.date != undefined &&
        query.userresponse === "true"
      ) {
        try {
          const results = await client.collection(userResponseCollection)
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
            .toArray();
          if (results[0].usersResponse.length) {
            res.json(results);
          } else {
            let obj = {};
            obj["loginResponse"] = false;
            res.json(obj);
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: true, message: err.message });
        } finally {
          await client.close()
        }
      } else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.date != undefined &&
        query.userId != undefined
      ) {
        try {
         // const collection = db.collection('myCollection');
          const requestQuery = {  date: query.date, "usersAnswer.userId": query.userId };
          const results = await collection.countDocuments(requestQuery);
         // const results = await collection.find({ date: query.date, "usersAnswer.userId": query.userId }).count().toArray();
          const resp = results;
          res.json(resp);
        } catch (err) {
          // handle error
          console.error(err)
          res.status(500).json({ error: true, message: err.message });
        }
        finally {
          if(client){
            await client.close()
          }
        }
      } else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query
      ) {
        try {
          const results = await collection.find(query).toArray();
          const resp = results;
          res.json(resp);
          await client.close()
        } catch (err) {
          // handle error
          console.error(err)
          res.status(500).json({ error: true, message: err.message });
        }
        finally {
          if(client){
            await client.close()
          }
        }
      } else {
        try {
          const results = await collection.find({}).toArray();
          const resp = results;
          res.json(resp);
        } catch (err) {
          // handle error
          console.error(err)
          res.status(500).json({ error: true, message: err.message });
        }
        finally {
          if(client){
            await client.close()
          }
        }
      }
  })
  .post(async function(req, res) {

    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
      var usersResponse = req.body;
      usersResponse.usersAnswer.map(userAnswer => {
        userAnswer.answers.map(answer => {
          let id = uuidv5(answer.question, uuidv5.DNS);
          Object.assign(answer, { _id: id });
        });
      });
      const collection = client.db('jindarshan').collection(userResponseCollection);
      const userResponseResult =  await collection.insertOne(usersResponse)
      console.log(userResponseResult.insertedId.toHexString());
      res.send("update is successful " + userResponseResult.insertedId.toHexString());
      await client.close()
  })
  .patch(async function(req, res) {
    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
     var usersResponse = req.body;
      const collection = client.db('jindarshan').collection(userResponseCollection);
      let query = req.query;
      console.log(query)
      if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.date != null &&
        query.date != undefined &&
        query.update === "true" &&
        query.update != undefined
      ) {

        await collection.updateOne(
          { date: query.date },
          { $push: { usersAnswer: usersResponse } }
        );
        res.send("update is successful");
        await client.close()
      }
  });

userReponseRouter
  .route("/:id")
  .get(async function(req, res) {
    var Id = new ObjectId(req.params.id);
    const client = await mongodb.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
      const collection = client.db('jindarshan').collection(userResponseCollection);
      try {
        const results = await collection.findOne({ _id: Id });
        res.json(results);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: err.message });
      } finally {
        await client.close()
      }
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
      var reqBody = req.body;
      const collection = client.db('jindarshan').collection(questionsCollection);
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

module.exports = userReponseRouter;
