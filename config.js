const constants = {
  mongoDbUrl:
    "mongodb://dbuser:password%40123@cluster0-shard-00-00-qqpkg.mongodb.net:27017,cluster0-shard-00-01-qqpkg.mongodb.net:27017,cluster0-shard-00-02-qqpkg.mongodb.net:27017/jindarshandev?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true/",
  databaseName: "jindarshandev",
  questionsCollection: "questions",
  usersCollections: "users",
  commentsCollections: "comments",
  userResponseCollection: "usersresponse",
  examquestionsCollection: "examquestions",
  examusersCollections: "examusers",
  examuserResponseCollection: "examusersresponse",
  bhajanCollection: "bhajan",
  bhajanReactionsCollection: "bhajanreactions"
};
module.exports = constants;

//mongodb://dbuser:password%40123@cluster0-shard-00-00-qqpkg.mongodb.net:27017,cluster0-shard-00-01-qqpkg.mongodb.net:27017,cluster0-shard-00-02-qqpkg.mongodb.net:27017/jindarshan?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true/

// {
//     "_id": "5eb27e35224458201fc3ebd5",
//     "fullname": "Rahul Jain",
//     "city": "Bangalore",
//     "address": "G-02 Ambika homes Ashraya layout 6th cross 2nd stage , Mahadevpura , graphite india",
//     "mobile": "+917987415323"
// },
// {
//     "_id": "5eb2a40e10c847c93803c8e7",
//     "fullname": "Anuj Jain",
//     "city": "Bangalore",
//     "address": "G-02 Ambika homes Ashraya layout 6th cross 2nd stage , Mahadevpura , graphite india",
//     "mobile": "+917987415323"
// }

// {

//     "date": "25-APR",
//     "usersAnswer": [
//         {
//             "score": 17,
//             "time": "30/04/2020, 20:40:48",
//             "comment": "best",
//             "answers": [
//                 {
//                     "question": "दान चार प्रकार का होता है|",
//                     "answer": "YES"
//                 },
//                 {
//                     "question": "प्रथम तीथकं र ,बालक आददनाथ का जन्म चौथे काल मेहुआw था।",
//                     "answer": "YES"
//                 },
//                 {
//                     "question": "तीर्थंकर के जन्म कल्याणक में लोकांतिक देवw आते हैं।",
//                     "answer": "YES"
//                 },
//                 {
//                     "question": "तीर्थंकर के जन्म कल्याणक में लोकांतिक देव आतेw हैं।",
//                     "answer": "YES"
//                 },
//                 {
//                     "question": "तीर्थंकर के जन्म कल्याणक मेंw लोकांतिक देव आते हैं।",
//                     "answer": "YES"
//                 },
//                 {
//                     "question": "तीर्थंकर के जन्मw कल्याणक में लोकांतिक देव आते हैं।",
//                     "answer": "YES"
//                 },
//                 {
//                     "question": "तीर्थंकर wके जन्म कल्याणक में लोकांतिक देव आते हैं।",
//                     "answer": "YES"
//                 },
//                 {
//                     "question": "तीर्थंकरw के जन्म कल्याणक में लोकांतिक देव आते हैं।",
//                     "answer": "YES"
//                 }
//             ]
//         }
//     ]
// }
