mongoose        		= require "mongoose"
passport        		= require "passport"
colors          		= require "colors"
util            		= require "util"
async           		= require "async"
fs              		= require "fs"
UserModel       		= require "../models/User"
CityModel       		= require "../models/City"
JobModel        		= require "../models/Job"
CategoryModel   		= require "../models/Category"
MessageModel 				= require "../models/Message"
NotificationsModel	= require "../models/Notification"
AuthLevel       		= require("../../config/Passport").AUTH_LEVEL

module.exports.setup = (app) ->
	# logout user
	app.get "/logout", logMeOut

	# login user
	app.post "/login", logMeIn

	# update user details
	app.post "/user/update", updateMe

	# uploads profile picture
	app.post "/user/uploadpicture", uploadProfilePicture

	# Is current session holder authenticated?
	app.get "/isAuthenticated", isUserAuthenticated

getBiddedJobs = (usr, clb) ->
	JobModel.find "bidders.id":usr.id, (err, jobs) ->
		clb err, jobs

getCreatedJobs = (usr, clb) ->
	JobModel.find "author.id":usr.id, (err, jobs) ->
		clb err, jobs

getSentMessages = (usr, clb) ->
	MessageModel.find {"author.id": usr.id}, (err, messages) ->
		clb err, messages

getReceivedMessages = (usr, clb) ->
	MessageModel.find {"to.id": usr.id}, (err, messages) ->
		clb err, messages

getNotifications = (usr, clb) ->
	NotificationsModel.find {}, (err, notifications) ->
		clb err, notifications

populateUser = (usr, clb) ->
	getBiddedJobs usr, (err, jobs) ->
		return clb err if err?
		usr.biddedJobs = jobs
		getCreatedJobs usr, (err, jobs) ->
			return clb err if err?
			usr.createdJobs = jobs
			usr.inbox = {}
			getSentMessages usr, (err, sentMessagess) ->
				return clb err if err?
				usr.inbox.sent = sentMessagess
				getReceivedMessages usr, (err, recvMessages) ->
					return clb err if err?
					usr.inbox.received = recvMessages
					getNotifications usr, (err, notifications) ->
						return clb err if err?
						usr.notifications = notifications
						clb err, usr

isUserAuthenticated = (req, res, next) ->
	user = req.user
	return res.send(403) if not user?
	populateUser user, (err, user) ->
		next err if err?
		res.send user

	# UserModel
	# .find _id: user._id
	# .populate("createdJobs biddedJobs inbox.sent inbox.received")
	# .exec (err, result) ->
	# 	res.send(result[0])

logMeOut = (req, res) ->
	req.logout()
	res.redirect(200, "/")

logMeIn = (req, res, next) ->
	if req.body.rememberme
		req.session.cookie.maxAge = 30*24*60*60*1000
	else
		req.session.cookie.expires = false
	pass = passport.authenticate "local", (err, user, info) ->
		return next(err) if err?
		return res.status(401).send(info.message) if not user?
		req.logIn user, (err) ->
			return next(err) if err?
			populateUser user, (err, user) ->
				res.send user

			# UserModel
			# .find _id: user._id
			# .populate "createdJobs biddedJobs inbox.sent inbox.received"
			# .exec (err, result) ->
			# 	res.send(result[0])
	pass(req, res, next)

updateMe = (req, res) ->
	usr = req.user
	console.log usr
	return res.status(422).send "You're not logged in" if not usr?
	data = req.body
	delete data._id
	UserModel
	.findByIdAndUpdate(usr._id, data)
	.exec (err, cnt) ->
		console.log(err);
		return res.status(422).send(err.message) if err?
		res.send(200)

uploadProfilePicture = (req, res) ->
	usr = req.user
	return res.status(422).send "You're not logged in" if not usr?
	UserModel
	.findById(req.user._id)
	.exec (err, user) ->
		console.log req.files
		file = req.files.file
		fs.readFile file.path, (err, data) ->
			imguri  = "img/#{usr.username}.png"
			newPath = "www/#{imguri}"
			fs.writeFile newPath, data, (err) =>
				return res.send(422) if err?
				user.profilePic = imguri
				user.save()
				res.send(imguri)

# app.post("user/:id/rate/:rating", (req, res) ->
#     UserModel
#     .findOne(_id: req.params.id)
#     .exec (err, user) ->
#         rate = req.params.rating
#         try
#             throw Error("Not a number") if not util.isNumber(rate)
#             rate = rate.clamp(1, 5)
#             numvotes = user.numVotes
#             user.numVotes += 1
#         catch e
#             res.status(422)
# )