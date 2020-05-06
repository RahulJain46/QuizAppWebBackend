var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb').MongoClient;

module.exports = function () {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    },
        function (email, password, done) {
            var url = 'mongodb://accountAdmin01:changeMe@localhost:27017/fortlisting';

            mongodb.connect(url, function (err, db) {
                var collection = db.collection('users');
                collection.findOne({
                    email: email
                },
                    function (err, results) {
                        if (results.password === password) {
                            var user = results;
                            done(null, user);
                        } else {
                            done(null, false, { message: 'bad password' });
                        }
                    });
            });

        }));
};