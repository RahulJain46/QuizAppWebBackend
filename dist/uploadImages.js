const express = require("express");
const router = express.Router();
const multer = require("multer");
var aws = require("aws-sdk");
var multerS3 = require("multer-s3");

var s3 = new aws.S3();

aws.config.update({
  secretAccessKey: process.env.SECRETACCESSKEY,
  accessKeyId: process.env.ACCESSKEYID,
  region: "ap-south-1"
});

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "jindarshan1",
    acl: "public-read",
    cacheControl: "max-age=31536000",
    contentType: function(req, file, cb) {
      cb(null, "image/jpeg");
    },
    key: function(req, file, cb) {
      cb(null, file.originalname);
    }
  })
});

const singleUpload = upload.array("image");
router.post("/", (req, res) => {
  singleUpload(req, res, function(err) {
    if (err || req.files === undefined) {
      return res.status(422).send({ errors: [{ title: "no file uploaded" }] });
    }
    let arr = [];
    let obj = {};
    req.files.map(file => {
      obj["fileName"] = file.originalname;
      obj["url"] = file.location;
      arr.push(obj);
      return arr;
    });
    return res.json({ "image url": arr });
  });
});

module.exports = router;
