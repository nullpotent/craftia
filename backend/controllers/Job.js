var AuthLevel, CategoryModel, CityModel, JobModel, Messaging, UserCtrl, UserModel, async, bidOnJob, bidOnJobHandler, cancelBidOnJob, cancelBidOnJobHandler, colors, createNewJobHandler, deleteJob, fetchOpenJobs, findCategory, findCity, findJob, fs, listOpenJobsHandler, mongoose, passport, pickWinner, pickWinnerHandler, rateJob, rateJobHandler, saveJob, updateJob, util, _,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

mongoose = require("mongoose");

passport = require("passport");

colors = require("colors");

util = require("util");

async = require("async");

fs = require("fs");

UserModel = require("../models/User");

CityModel = require("../models/City");

JobModel = require("../models/Job");

CategoryModel = require("../models/Category");

Messaging = require("../modules/Messaging");

_ = require("underscore");

AuthLevel = require("../../config/Passport").AUTH_LEVEL;

UserCtrl = require("../controllers/User");

module.exports.saveJob = saveJob = function(usr, jobData, clb) {
  if (usr.type !== AuthLevel.CUSTOMER) {
    return clb("You don't have permissions to create a new job");
  }
  return async.series([findCity(jobData.address.city), findCategory(jobData)], function(err, results) {
    var job;
    if (err != null) {
      return clb(err);
    }
    delete jobData._id;
    job = new JobModel(jobData);
    job.status = "open";
    job.address.zip = results[0].zip;
    job.author = usr;
    return job.save(function(err, job) {
      if (err != null) {
        return clb(err);
      }
      return usr.save(function(err, cnt) {
        return clb(err, job, usr);
      });
    });
  });
};

module.exports.bidOnJob = bidOnJob = function(usr, jobId, clb) {
  if ((usr == null) || (usr.type !== AuthLevel.CRAFTSMAN)) {
    return clb("You're not authorized");
  }
  return JobModel.findOne({
    _id: jobId
  }).exec(function(err, job) {
    var _ref;
    if ((_ref = job.status) === "closed" || _ref === "finished") {
      return clb("This job is finished");
    }
    job.bidders.push(usr);
    return job.save(function(err) {
      if (err != null) {
        return res.status(422).send(err.message);
      }
      return Messaging.sendNotification({
        receiver: job.author.username,
        subject: "Someone bidded on your offering",
        type: "job",
        body: "Craftsman " + usr.username + " just bidded on your job offering " + job.title + " under " + job.category + " category"
      }, function(err) {
        return clb(err, job);
      });
    });
  });
};

module.exports.pickWinner = pickWinner = function(user, winner, jobId, clb) {
  if ((user == null) || user.type !== AuthLevel.CUSTOMER) {
    return clb("You don't have permissions to pick winning bid");
  }
  return JobModel.findById(jobId).elemMatch("bidders", {
    _id: winner._id
  }).exec(function(err, job) {
    if (err != null) {
      return clb(err);
    }
    if (job == null) {
      return clb(new Error("You haven't bidded yet", clb));
    }
    job.winner = winner;
    job.status = "closed";
    return job.save(function(err, job) {
      return clb(err, job);
    });
  });
};

module.exports.findJob = findJob = function(req, res, next) {
  return JobModel.findOne({
    _id: req.params.id
  }).exec(function(err, job) {
    if (err != null) {
      return next(err);
    }
    return res.send(job);
  });
};

module.exports.findCity = findCity = function(cityName) {
  return function(clb) {
    return CityModel.findOne({
      name: cityName
    }).exec(function(err, city) {
      if (city == null) {
        return clb(new Error("No city " + cityName + " in database!", null));
      } else {
        return clb(err, city);
      }
    });
  };
};

module.exports.findCategory = findCategory = function(jobdata) {
  return function(clb) {
    return CategoryModel.findOne({
      category: jobdata.category
    }).exec(function(err, cat) {
      var exists, _ref;
      if (cat == null) {
        return clb(new Error("No such category " + jobdata.category, null));
      }
      exists = (_ref = jobdata.subcategory, __indexOf.call(cat != null ? cat.subcategories : void 0, _ref) >= 0);
      if (!exists || (err != null)) {
        return clb(new Error("No subcategory " + jobdata.subcategory + " in category " + jobdata.category, null));
      }
      return clb(err, cat);
    });
  };
};

module.exports.cancelBidOnJob = cancelBidOnJob = function(usr, jobId, clb) {
  if (usr.type !== AuthLevel.CRAFTSMAN || (usr == null)) {
    return clb("You're not authorized");
  }
  return JobModel.findOne({
    _id: jobId
  }).exec(function(err, job) {
    var bidder, ind, _ref;
    if ((_ref = job.status) === "closed" || _ref === "finished") {
      return clb(new Error("Job is finished", null));
    }
    bidder = (job.bidders.filter((function(_this) {
      return function(el) {
        return el.id === usr.id;
      };
    })(this)))[0];
    ind = job.bidders.indexOf(bidder);
    job.bidders.splice(ind, 1);
    return job.save(function(err) {
      return Messaging.sendNotification({
        receiver: job.author.username,
        type: "job",
        body: "Craftsman " + usr.username + " just canceled their bid on your job offering " + job.title + " under " + job.category + " category"
      }, function(err) {
        return clb(err, job);
      });
    });
  });
};

module.exports.rateJob = rateJob = function(user, jobId, mark, comment, clb) {
  if (user.type !== AuthLevel.CUSTOMER || (user == null)) {
    return clb("You don't have permissions to rate");
  }
  if (!((1 < mark && mark < 6))) {
    return clb("Mark is out of range");
  }
  return JobModel.findById(jobId).exec(function(err, job) {
    var alreadyRated, winner;
    if (err != null) {
      return clb(err);
    }
    if (job.author.id !== user.id) {
      return clb("You're not the creator of this job");
    }
    if (job.status !== "finished") {
      return clb("This job isn't finished and you can't rate the craftsman");
    }
    winner = job.winner;
    alreadyRated = job.rated;
    if (alreadyRated) {
      return clb("You've already rated this job");
    }
    job.rated = true;
    return UserModel.findById(winner._id, function(err, winnerUser) {
      winnerUser.rating.jobs.push({
        job: job,
        comment: comment
      });
      winnerUser.rating.totalVotes += 1;
      winnerUser.rating.avgRate += mark;
      winnerUser.rating.avgRate /= winnerUser.rating.totalVotes;
      return async.series([winnerUser.save.bind(winnerUser, job.save.bind(job))], clb);
    });
  });
};

module.exports.fetchOpenJobs = fetchOpenJobs = function(user, clb) {
  var jobs;
  jobs = user.createdJobs.filter(function(job) {
    return job.status === "open";
  });
  jobs.map(function(job) {
    return job.toObject();
  });
  return clb(null, jobs);
};

deleteJob = function(req, res) {
  var usr;
  usr = req.user;
  if ((usr == null) || usr.type !== AuthLevel.CUSTOMER) {
    return res.send(422);
  }
  return JobModel.findOne({
    _id: req.params.id
  }).remove().exec(function(err, result) {
    return res.send(200);
  });
};

updateJob = function(req, res) {
  var checkCity, findCat, jobData, usr, _ref, _ref1;
  usr = req.user;
  jobData = req.body;
  if ((usr == null) || usr.type !== AuthLevel.CUSTOMER) {
    return res.send(422);
  }
  if (((_ref = jobData.address) != null ? _ref.city : void 0) != null) {
    checkCity = findCity(jobData.address.city);
  } else {
    checkCity = function(clb) {
      return clb(null, null);
    };
  }
  if (((_ref1 = jobData.category) != null ? _ref1.subcategory : void 0) != null) {
    findCat = findCategory(jobData);
  } else {
    findCat = function(clb) {
      return clb(null, null);
    };
  }
  return async.series([checkCity, findCat], function(err, results) {
    var id;
    id = req.params.id;
    return JobModel.findByIdAndUpdate(id, jobData).exec(function(err, results) {
      if ((err != null) || results < 1) {
        return res.send(422);
      }
      return JobModel.findById(id).exec(function(err, job) {
        if (err != null) {
          return res.status(422).send(err.message);
        }
        return res.send(job);
      });
    });
  });
};

bidOnJobHandler = function(req, res, next) {
  var jobId, user;
  user = req.user;
  jobId = req.params.id;
  return bidOnJob(user, jobId, function(err, job) {
    if (err != null) {
      return res.status(422).send(err);
    }
    return res.send(job);
  });
};

pickWinnerHandler = function(req, res, next) {
  var jobId, user, winnerId;
  user = req.user;
  winnerId = req.params.winner;
  jobId = req.params.id;
  return pickwinner(user, winnerId, jobId, function(err, job) {
    if (err != null) {
      return res.status(422).send(err);
    }
    return res.send(job);
  });
};

cancelBidOnJobHandler = function(req, res, next) {
  var jobId, user;
  jobId = req.params.id;
  user = req.user;
  return cancelBidOnJob(user, jobId, function(err, job) {
    if (err != null) {
      return res.status(422).send(err);
    }
    return res.send(job);
  });
};

rateJobHandler = function(req, res, next) {
  var comment, jobId, mark, user;
  jobId = req.params.id;
  mark = req.params.mark;
  comment = req.params.comment;
  user = req.user;
  return rateJob(user, jobId, mark, comment, function(err, job) {
    if (err != null) {
      return res.status(422).send(err);
    }
    return res.send(job);
  });
};

listOpenJobsHandler = function(req, res) {
  if (req.user == null) {
    return res.status(403).send("You're not authorized");
  }
  return JobModel.find({
    status: "open"
  }).exec(function(err, jobs) {
    if (err != null) {
      return res.status(422).send(err);
    }
    return res.send(jobs);
  });
};

createNewJobHandler = function(req, res, next) {
  var jobData, usr;
  jobData = req.body;
  usr = req.user;
  if (usr == null) {
    return next("User doesn't exist");
  }
  return saveJob(usr, jobData, function(err, usr, job) {
    if (err != null) {
      return next(err);
    }
    return res.send(job);
  });
};

module.exports.setup = function(app) {
  app.post("/job/:id/bid", bidOnJobHandler);
  app.post("/job/:id/rate/:mark", rateJobHandler);
  app.post("/job/:id/:uid/cancelbid", cancelBidOnJobHandler);
  app.post("/job/:id/pickawinner/:winner", pickWinnerHandler);
  app.post("/job/new", createNewJobHandler);
  app.get("/job/list/all", listOpenJobsHandler);
  app.post("/job/:id/delete", deleteJob);
  app.post("/job/:id/update", updateJob);
  return app.post("/job/:id", findJob);
};
