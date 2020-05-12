module.exports = app => {
  app.get("/", function(req, res, next) {
    res.json("Welcome to Shivnari API");
  });
};
