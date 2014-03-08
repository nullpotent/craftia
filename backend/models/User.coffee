mongoose = require "mongoose"
bcrypt = require "bcrypt-nodejs"
JobModel = require "./Job"

schema = mongoose.Schema
	username:
		type: String
		required: true
		unique: true

	email:
		type: String
		required: true
		unique: true

	password: 
		type: String
		required: true

	accessToken:
		type: String

	name:
		type: String
		required: true

	surname: 
		type: String
		required: true

	type:
    	type: String
    	enum: ["Admin", "Craftsman", "Customer"]
    	required: true

	telephone:
		type: String
		required: true

	createdJobs: [ 
		type: mongoose.Schema.Types.ObjectId
		ref: "Job"
	]

schema.pre "save", (next) ->
	user = @
	if not user.isModified("password")
		return next()

	bcrypt.genSalt(
		10,
		(err, salt) ->
			if err?
				return next(err)
			bcrypt.hash(
				user.password,
				salt,
				() ->
					#progress
				(err, hash) ->
					#after callback
					if err?
						return next(err)
					user.password = hash
					next()
			)
	)

schema.methods.comparePassword = (password, cb) ->
	bcrypt.compare(password, this.password, (err, isMatch) ->
		if err?
			return cb(err)
		cb(null, isMatch)
	)

schema.methods.generateRandomToken = () ->
	user = @
	chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
	token = new Date().getTime() + "_"
	for x in [0...16]
		i = Math.floor(Math.random() * 62)
		token += chars.charAt(i)
	return token

# schema.methods.createNewJob = (job) ->
# 	try
# 		@createdJobs.push(JobModel.newJob(job))
# 		@save()
# 	catch e
# 		throw new Error(e)

module.exports = mongoose.model("User", schema)
