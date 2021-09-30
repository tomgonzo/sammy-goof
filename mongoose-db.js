var mongoose = require('mongoose');
var cfenv = require("cfenv");
const { initial } = require('lodash');
const fs = require('fs')
const path = require('path')
var Schema = mongoose.Schema;

var Todo = new Schema({
  content: Buffer,
  updated_at: Date,
});

mongoose.model('Todo', Todo);

var User = new Schema({
  username: String,
  password: String,
});

mongoose.model('User', User);

// CloudFoundry env vars
var mongoCFUri = cfenv.getAppEnv().getServiceURL('goof-mongo');
console.log(JSON.stringify(cfenv.getAppEnv()));

// Default Mongo URI is local
const DOCKER = process.env.DOCKER
if (DOCKER === '1') {
  var mongoUri = 'mongodb://goof-mongo/express-todo';
} else {
  var mongoUri = 'mongodb://localhost/express-todo';
}


// CloudFoundry Mongo URI
if (mongoCFUri) {
  mongoUri = mongoCFUri;
} else if (process.env.MONGOLAB_URI) {
  // Generic (plus Heroku) env var support
  mongoUri = process.env.MONGOLAB_URI;
} else if (process.env.MONGODB_URI) {
  // Generic (plus Heroku) env var support
  mongoUri = process.env.MONGODB_URI;
}

console.log("Using Mongo URI " + mongoUri);

mongoose.connect(mongoUri, { sslCert: fs.readFileSync(path.join(__dirname, 'ca-certificate.crt')) });

User = mongoose.model('User');
User.find({ username: 'admin' }).exec(function (err, users) {
  console.log(err)
  console.log(users);
  if (!users || users.length === 0) {
    console.log('no admin');
    new User({ username: 'admin', password: 'SuperSecretPassword' }).save(function (err, user, count) {
      if (err) {
        console.log(err)
        console.log('error saving admin user');
      }
    });
  }
});