const { Router } = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const bhajanRouter = Router();

// MongoDB connection string
const connectionString =
  "mongodb://dbuser:password%40123@cluster0-shard-00-00-qqpkg.mongodb.net:27017,cluster0-shard-00-01-qqpkg.mongodb.net:27017,cluster0-shard-00-02-qqpkg.mongodb.net:27017/jindarshan?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
//const connectionString = process.env.MONGODBURL
console.log(connectionString, "string");
//const uri = 'mongodb://dbuser:password%40123@cluster0-shard-00-00-qqpkg.mongodb.net:27017,cluster0-shard-00-01-qqpkg.mongodb.net:27017,cluster0-shard-00-02-qqpkg.mongodb.net:27017/jindarshan?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';
const uri = connectionString;

// Define a route to retrieve all users or create a new user
bhajanRouter
  .route("/")
  .get(async (req, res) => {
    try {
      const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");

      // Get a reference to the "users" collection
      const usersCollection = client.db("jindarshan").collection("bhajan");

      const users = await usersCollection.find().toArray();
      res.json(users);

      // Close the database connection after the response is sent
      await client.close();
    } catch (err) {
      console.error("Error retrieving users", err);
      res.status(500).send("Internal server error");
    }
  })
  .post(async (req, res) => {
    const { name, email, age } = req.body;

    if (!name || !email || !age) {
      res.status(400).send("Invalid input");
      return;
    }

    try {
      const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");

      // Get a reference to the "users" collection
      const usersCollection = client.db("mydatabase").collection("users");

      const result = await usersCollection.insertOne({
        name,
        email,
        age,
      });

      res.json(result.ops[0]);

      // Close the database connection after the response is sent
      await client.close();
    } catch (err) {
      console.error("Error creating user", err);
      res.status(500).send("Internal server error");
    }
  });

module.exports = bhajanRouter;
