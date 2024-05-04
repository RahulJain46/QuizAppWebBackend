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
// const connectionString =
//   "mongodb://dbuser:password%40123@cluster0-shard-00-00-qqpkg.mongodb.net:27017,cluster0-shard-00-01-qqpkg.mongodb.net:27017,cluster0-shard-00-02-qqpkg.mongodb.net:27017/jindarshan?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
const connectionString = process.env.MONGODBURL;
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
      let results = [];
      if (query.date[2] === "allDates") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        results = await collection
          .aggregate([
            // Match documents where the questions array is not empty
            {
              $match: {
                questions: { $exists: true, $not: { $size: 0 } },
              },
            },
            // Project only the date field and parse the date string if it matches the expected format
            {
              $addFields: {
                parsedDate: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $regexMatch: {
                            input: "$date",
                            regex: /^\d{2}-\d{2}-\d{4}$/,
                          },
                        }, // Check format
                        {
                          $let: {
                            vars: {
                              day: { $toInt: { $substrCP: ["$date", 0, 2] } },
                              month: { $toInt: { $substrCP: ["$date", 3, 2] } },
                              year: { $toInt: { $substrCP: ["$date", 6, 4] } },
                            },
                            in: {
                              $and: [
                                { $gte: ["$$day", 1] }, // Day should be greater than or equal to 1
                                {
                                  $cond: {
                                    if: { $eq: ["$$month", 2] }, // If month is February
                                    then: {
                                      $lte: [
                                        "$$day",
                                        {
                                          $cond: {
                                            if: {
                                              $eq: [{ $mod: ["$$year", 4] }, 0],
                                            },
                                            then: 29,
                                            else: 28,
                                          },
                                        },
                                      ], // Check for leap year
                                    },
                                    else: {
                                      $lte: [
                                        "$$day",
                                        {
                                          $switch: {
                                            branches: [
                                              {
                                                case: {
                                                  $in: [
                                                    "$$month",
                                                    [1, 3, 5, 7, 8, 10, 12],
                                                  ],
                                                },
                                                then: 31,
                                              }, // Months with 31 days
                                              {
                                                case: {
                                                  $in: [
                                                    "$$month",
                                                    [4, 6, 9, 11],
                                                  ],
                                                },
                                                then: 30,
                                              }, // Months with 30 days
                                            ],
                                            default: 0,
                                          },
                                        },
                                      ], // Default case
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                    then: {
                      $dateFromString: {
                        dateString: "$date",
                        format: "%d-%m-%Y", // Specify the date format
                      },
                    },
                    else: null, // If the date format doesn't match or the date is invalid, set parsedDate to null
                  },
                },
              },
            },
            // Match documents where the parsed date exists and is not null
            {
              $match: {
                parsedDate: { $exists: true, $ne: null },
              },
            },
            // Match dates that are not more than today
            {
              $match: {
                parsedDate: {
                  $lte: today, // Compare with today's date
                },
              },
            },
            {
              $project: {
                _id: 0,
                date: 1,
              },
            },
          ])
          .toArray();
      } else {
        results = await collection.find({}, { date: 1 }).toArray();
        console.log(results);
      }

      //

      // const kbcusersresponseCollection = client
      //   .db("jindarshan")
      //   .collection("kbcusersresponse");
      // const usersresponseCollection = client
      //   .db("jindarshan")
      //   .collection("usersresponse");

      // const startDate = new Date();
      // const endDate = new Date(startDate);
      // endDate.setFullYear(endDate.getFullYear() + 1);

      // const incrementDate = (date) => {
      //   const newDate = new Date(date);
      //   newDate.setDate(newDate.getDate() + 1);
      //   return newDate;
      // };
      // let currentDate = startDate;
      // let userReponses = [];
      // let kbcuserResponses = [];

      // for (const result of results) {
      //   if (
      //     Object.keys(result).length > 0 &&
      //     result?.date !== undefined &&
      //     result?.date.length > 0 &&
      //     result?.questions !== undefined &&
      //     result?.questions?.length > 0
      //   ) {
      //     if (result?.date === "03-05-2024") {
      //       break; // Break out of the loop if the date is "03-05-2024"
      //     }
      //     const newDateString = `${currentDate
      //       .getDate()
      //       .toString()
      //       .padStart(2, "0")}-${(currentDate.getMonth() + 1)
      //       .toString()
      //       .padStart(2, "0")}-${currentDate.getFullYear()}`;

      //     currentDate = incrementDate(currentDate);
      //     let userResponse = {
      //       date: newDateString,
      //       usersAnswer: [],
      //     };
      //     let kbcUserResponse = {
      //       date: newDateString,
      //       usersAnswer: [],
      //     };
      //     userReponses.push(userResponse);
      //     kbcuserResponses.push(kbcUserResponse);
      //   }
      // }

      // results.forEach((result) => {
      //   if (
      //     Object.keys(result).length > 0 &&
      //     result?.date !== undefined &&
      //     result?.date.length > 0 &&
      //     result?.questions !== undefined &&
      //     result?.questions?.length > 0
      //   ) {
      //     if (result?.date === "03-05-2024") {
      //       return;
      //     }
      //     const newDateString = `${currentDate
      //       .getDate()
      //       .toString()
      //       .padStart(2, "0")}-${(currentDate.getMonth() + 1)
      //       .toString()
      //       .padStart(2, "0")}-${currentDate.getFullYear()}`;

      //     currentDate = incrementDate(currentDate);
      //     let userResponse = {
      //       date: newDateString,
      //       usersAnswer: [],
      //     };
      //     let kbcUserResponse = {
      //       date: newDateString,
      //       usersAnswer: [],
      //     };
      //     userReponses.push(userResponse);
      //     kbcuserResponses.push(kbcUserResponse);
      //     // const newRecord = {
      //     //   ...result,
      //     //   date: newDateString,
      //     // };
      //     //delete newRecord._id;
      //     //return newRecord;
      //   }
      // });
      // res.json(kbcuserResponses);
      // await kbcusersresponseCollection.insertMany(kbcuserResponses);
      // const userResponseResult = await usersresponseCollection.insertMany(
      //   userReponses
      // );
      // console.log(userResponseResult.insertedId.toHexString());
      // res.send(
      //   "update is successful " + userResponseResult.insertedId.toHexString()
      // );
      // let resp = newRecords;
      // await collection.insertMany(newRecords);
      //  res.json(results);
      res.json(results);
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
