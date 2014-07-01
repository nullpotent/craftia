// Generated by CoffeeScript 1.7.1
(function() {
  var JobModel, Message, Notification, UserModel, async, mongoose;

  mongoose = require("mongoose");

  UserModel = require("../models/User");

  Message = require("../models/Message");

  Notification = require("../models/Notification");

  JobModel = require("../models/Job");

  async = require("async");

  module.exports.sendNotification = function(notif, clb) {
    if (clb == null) {
      clb = function() {};
    }
    return UserModel.findById(notif.receiver).exec(function(err, receiver) {
      var msg, out;
      if (err != null) {
        return typeof clb === "function" ? clb(err) : void 0;
      }
      out = {};
      msg = new Notification({
        type: "system",
        message: notif.body,
        dateSent: Date.now(),
        isRead: false,
        to: receiver
      });
      return msg.save(clb);
    });
  };

  module.exports.sendMessage = function(message, clb) {
    if (clb == null) {
      clb = function() {};
    }
    return UserModel.find({
      username: {
        $in: [message.sender, message.receiver]
      }
    }).exec(function(err, results) {
      var msg, out, receiver, sender;
      if (err != null) {
        return typeof clb === "function" ? clb(err) : void 0;
      }
      out = {};
      results.forEach(function(res) {
        return out[res.username] = res;
      });
      sender = out[message.sender];
      receiver = out[message.receiver];
      msg = new Message({
        author: sender,
        to: receiver,
        data: message.data,
        subject: message.subject,
        message: message.body,
        dateSent: Date.now(),
        isRead: false
      });
      return msg.save(clb);
    });
  };

  module.exports.sendJobMessage = function() {
    throw "Not implemented";
  };

}).call(this);
