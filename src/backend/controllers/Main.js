// Generated by CoffeeScript 1.7.1
(function() {
  var AuthLevel, JobCtrl, UserModel, async;

  async = require("async");

  UserModel = require("../models/User");

  AuthLevel = require("../config/AuthLevels");

  JobCtrl = require("./Job");

  module.exports.setup = function(app) {
    return app.get("/", module.exports.showIndexPage);
  };

  module.exports.showIndexPage = function(req, res) {
    return res.render("main", {
      user: req.user
    });
  };

}).call(this);