mongoose = require "mongoose"
UserModel = require "../models/User"
Message = require "../models/Message"
Notification = require "../models/Notification"
JobModel = require "../models/Job"
async = require "async"

module.exports.sendNotification = (notif, clb = ->) ->
	UserModel
	.findOne username:notif.receiver
	.exec (err, receiver) ->
		out = {}

		msg = new Notification {
			type: "system"
			message: notif.body
			dateSent: Date.now()
			isRead: false
		}
		
		msg.save clb
			
module.exports.sendMessage = (message, clb = ->) ->
	UserModel
	.find username:$in:[message.sender, message.receiver]
	.exec (err, results) ->
		out = {}
		
		results.forEach (res) ->
			out[res.username] = res
			
		sender 		= out[message.sender]
		receiver 	= out[message.receiver]

		msg = new Message {
			author:
				username: sender.username
				id: sender._id
			to: 
				username: receiver.username
				id: receiver._id
			data: message.data
			subject: message.subject
			message: message.body
			dateSent: Date.now()
			isRead: false
		}
		
		msg.save clb

module.exports.sendJobMessage = ->
	throw "Not implemented"