var mongodb = require("mongodb");
var express = require("express");
var mongoClient = mongodb.MongoClient;
var objectId = require("mongodb").ObjectID;
// var multer = require("multer");
// var util = require("util");
var imagesRoute = express.Router();
//var fs = require("fs");
//ar upload = multer({ limits: { fileSize: 2000000 }, dest: "/uploads/" });
var { mongoDbUrl, commentsCollections, databaseName } = require("../config");

// const connectionString = process.env.MONGODBURL + process.env.DATABASENAME;

const connectionString = process.env.MONGODBURL;

// questionsRouter.route("/")
//  .post('/uploadpicture', upload.single('picture'), function (req, res){
//     if (req.file == null) {
//        // If Submit was accidentally clicked with no file selected...
//       res.render('index', { title:'Please select a picture file to submit!' });
//     } else {
//     MongoClient.connect(url, function(err, db){
//        // read the img file from tmp in-memory location
//        var newImg = fs.readFileSync(req.file.path);
//        // encode the file as a base64 string.
//        var encImg = newImg.toString('base64');
//        // define your new document
//        var newItem = {
//           description: req.body.description,
//           contentType: req.file.mimetype,
//           size: req.file.size,
//           img: Buffer(encImg, 'base64')
//        };
//     db.collection('yourcollectionname')
//        .insert(newItem, function(err, result){
//        if (err) { console.log(err); };
//           var newoid = new ObjectId(result.ops[0]._id);
//           fs.remove(req.file.path, function(err) {
//              if (err) { console.log(err) };
//              res.render('index', {title:'Thanks for the Picture!'});
//              });
//           });
//        });
//        };
//     });
// mongoClient.connect(connectionString, function(err, db) {
//   if (err) {
//     console.log("Sorry unable to connect to MongoDB Error:", err);
//   } else {
//     var bucket = new mongodb.GridFSBucket(db, {
//       chunkSizeBytes: 1024,
//       bucketName: "images"
//     });

//     fs.createReadStream(
//       "/Users/rahuljain/Desktop/Projects/JainDharshan/QuizAppWebBackend/image1.jpg"
//     )
//       .pipe(bucket.openUploadStream("image.jpg"))
//       .on("error", function(error) {
//         console.log("Error:-", error);
//       })
//       .on("finish", function() {
//         console.log("File Inserted!!");
//         process.exit(0);
//       });
//   }
// });

imagesRoute.route("/:filename").get(function (req, res) {
  // assign the URL parameter to a variable
  var filename = req.params.filename;
  // open the mongodb connection with the connection
  // string stored in the variable called url.
  var Id = new objectId(req.params.id);
  mongoClient.connect(connectionString, function (err, db) {
    db.collection("images")
      // perform a mongodb search and return only one result.
      // convert the variabvle called filename into a valid
      // objectId.
      .find({ _id: Id }, function (err, results) {
        // set the http response header so the browser knows this
        // is an 'image/jpeg' or 'image/png'
        res.setHeader("content-type", "image/jpeg");
        // send only the base64 string stored in the img object
        // buffer element

        res.json(results);
      });
  });
});

module.exports = imagesRoute;
