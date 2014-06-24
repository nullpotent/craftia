(function() {
  var db, dbURL, localURL, log, mongoose;

  mongoose = require("mongoose");

  localURL = "mongodb://localhost/craftia";

  dbURL = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || localURL;

  log = console.log.bind(console);

  mongoose.connect(dbURL);

  db = mongoose.connection;

  db.on("error", console.error.bind(console, "Connection error: "));

  db.once("open", function() {
    return log("Connected to DB");
  });

  module.exports = db;

}).call(this);