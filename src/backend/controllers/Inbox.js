// Generated by CoffeeScript 1.7.1
(function() {
  var MessageModel, Messaging, getReceivedMessages, getSentMessages, sendMessage;

  Messaging = require("../modules/Messaging");

  MessageModel = require("../models/Message");

  module.exports.setup = function(app) {
    app.post("/inbox/sendMessage", sendMessage);
    app.get("/inbox/received/:page", getReceivedMessages);
    app.get("/inbox/sent/:page", getSentMessages);
  };

  getReceivedMessages = function(req, res, next) {
    var page, perPage, user;
    user = req.user;
    if (user == null) {
      return res.send(403);
    }
    perPage = 5;
    page = req.params.page;
    page || (page = 0);
    return MessageModel.find({
      to: user
    }).populate({
      path: "to",
      select: "-password",
      model: "User"
    }).limit(perPage).skip(perPage * page).exec(function(err, messages) {
      if (err != null) {
        return res.status(422).send(err);
      }
      return res.send(messages);
    });
  };

  getSentMessages = function(req, res, next) {
    var page, perPage, user;
    user = req.user;
    if (user == null) {
      return res.send(403);
    }
    perPage = 5;
    page = req.params.page;
    page || (page = 0);
    return MessageModel.find({
      author: user
    }).populate({
      path: "to",
      select: "-password",
      model: "User"
    }).limit(perPage).skip(perPage * page).exec(function(err, messages) {
      if (err != null) {
        return res.status(422).send(err);
      }
      return res.send(messages);
    });
  };

  sendMessage = function(req, res, next) {
    var msg;
    msg = req.body;
    return Messaging.sendMessage(msg, function() {
      return res.send("Message sent!");
    });
  };

}).call(this);
