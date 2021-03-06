const JobModel = require("../models/Job");
const EmployerModel = require("../models/Employer");
const TalentModel = require("../models/Talent");

// get All Jobs
exports.getAllJobs = (req, resp) => {
  const perPage = 10;
  JobModel.find(
    {
      Status: "Pending",
    },
    {
      __v: 0,
      Proposals: 0,
      HiredTalent: 0,
    },
    (err, data) => {
      if (err)
        resp.status(404).json({
          message: "Can't get the jobs ",
        });
      else {
        const jobsCount = data.length;
        resp.status(200).send({
          jobsCount,
          jobs: data.map((data) => {
            return {
              data,
              request: {
                type: "GET",
                url: "http://localhost:5000/job/" + data._id,
              },
            };
          }),
        });
      }
    }
  )
    .sort([["createdAt", -1]])
    .limit(perPage)
    .skip((req.body.PageNumber - 1) * perPage);
};

// Search for jobs by skill
exports.searchforJobsBySkill = (req, resp) => {
  const perPage = 10;
  JobModel.find(
    {
      Skills: {
        $in: req.params.skill,
      },
    },
    {
      __v: 0,
      Proposals: 0,
      HiredTalent: 0,
    },
    (err, data) => {
      if (err)
        resp.status(404).json({
          message: "Can't get the jobs ",
        });
      else {
        const jobsCount = data.length;
        resp.status(200).send({
          jobsCount,
          jobs: data.map((data) => {
            return {
              data,
              request: {
                type: "GET",
                url: "http://localhost:5000/job/" + data._id,
              },
            };
          }),
        });
      }
    }
  )
    .sort([["createdAt", -1]])
    .limit(perPage)
    .skip((req.body.PageNumber - 1) * perPage);
};

//Get a job by ID

//FIX search by Category
exports.getAJobById = (req, resp) => {
  JobModel.findById(
    req.params.id,
    {
      __v: 0,
      Proposals: 0,
      HiredTalent: 0,
    },
    (err, data) => {
      if (err || !data) {
        resp.status(404).json({
          message: "Wrong ID entered",
        });
      } else {
        resp.status(200).send(data);
      }
    }
  );
};

// create new job and add it to the DB
exports.createNewJob = (req, resp) => {
  // Add Employer ID

  JobModel.create(
    {
      EmployerUserName: req.params.UserName,
      Name: req.body.Name,
      Category: req.body.Category,
      Description: req.body.Description,
      JobType: req.body.JobType,
      Skills: req.body.Skills,
      ExpertiseLevel: req.body.ExpertiseLevel,
      TalentsRequired: req.body.TalentsRequired,
      Country: req.body.Country,
      JobSuccessScore: req.body.JobSuccessScore,
      EnglishLevel: req.body.EnglishLevel,
      Earning: req.body.Earning,
      PaymentType: req.body.PaymentType,
      Price: req.body.Price,
      Duration: req.body.Duration,
      WeeklyHoursRequired: req.body.WeeklyHoursRequired,
      EmployerRating: req.body.EmployerRating,
      EmployerReview: req.body.EmployerReview,
      HiredTalent: req.body.HiredTalent,
      TalentRating: req.body.TalentRating,
      TalentReview: req.body.TalentReview,
      Proposals: req.body.Proposals,
      ConnectsNeeded: req.body.ConnectsNeeded,
      Status: req.body.Status,
    },
    (err, job) => {
      if (err)
        resp.status(404).json({
          message: "One of your fields is wrong ",
        });
      if (!err) {
        EmployerModel.findOne({
          UserName: job.EmployerUserName,
        }).then((employer) => {
          employer.addToJobs(job);
        });
        resp.status(200).send(job);
      }
    }
  );
};

//Find job by ID and edit
exports.findJobByIDAndUpdate = (req, resp) => {
  JobModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    (err, job) => {
      if (err)
        resp.status(404).send({
          message: "Please be sure you're updating an existing job ",
        });
      if (!err) {
        if (job.EmployerUserName == req.params.UserName) {
          resp.status(200).send(job);
        } else {
          resp.status(401).send({
            message: "This job is not belong to you",
          });
        }
      }
    }
  );
};

//Find job and make a proposal by Talent
exports.findJobAndMakeAProposalByTalent = (req, res) => {
  TalentModel.findOne(
    {
      UserName: req.params.UserName,
    },
    (err, talent) => {
      JobModel.findById(req.params.id, async (err, job) => {
        if (job && req.body.CoverLetter) {
          const isEligible = job.Proposals.find((item) => {
            return item.Talent.toString() === talent._id.toString();
          });
          const isEnoughConnects = () => {
            return talent.Connects >= job.ConnectsNeeded;
          };
          if (!isEligible && isEnoughConnects()) {
            await talent.deductFromConnects(job.ConnectsNeeded);
            await talent.addToProposals(job._id, req.body.CoverLetter);
            await job.addToProposals(talent._id, req.body.CoverLetter);
            await res.status(200).json({
              message: "You've successfully proposed to this job",
            });
          } else {
            res.status(401).json({
              message: "You Can't make a proposal to this job",
            });
          }
        }
        if (err || !job || !req.body.CoverLetter) {
          res.status(404).json({
            message:
              "Job ID is not correct or you haven't submitted a cover letter!",
          });
        }
      });
      if (err || !talent) {
        res.status(404).json({
          message: "Talent Username is not correct!",
        });
      }
    }
  );
};

//Find job and accept a proposal by Employer
exports.findJobAndAcceptAProposalByEmployer = (req, res, next) => {
  TalentModel.findOne(
    {
      UserName: req.params.TalentUserName,
    },
    (err, talent) => {
      if (talent) {
        JobModel.findOne(
          {
            _id: req.params.id,
            HiredTalent: {
              $nin: talent._id,
            },
            EmployerUserName: req.params.UserName,
            "Proposals.Talent": talent._id,
            Status: "Pending",
          },
          (err, job) => {
            if (job) {
              talent.addToJobs(job);
              // talent.returnConnects(job.ConnectsNeeded);
              req.body = {}; // clear requst body for secure the next update requst
              req.body.HiredTalent = talent._id;
              req.body.Status = "Ongoing";
              req.body.StartDate = Date.now();
              next();
            }
            if (err || !job) {
              res.status(404).json({
                message: "Sorry your request can't processed!",
              });
            }
          }
        );
      }
      if (err || !talent) {
        res.status(404).json({
          message: "Talent Username is not correct!",
        });
      }
    }
  );
};

// End job by employer using username
exports.endEmployerJobByUserName = (req, res, next) => {
  EmployerModel.findOne(
    {
      UserName: req.params.UserName,
    },
    (err, Employer) => {
      if (Employer) {
        JobModel.findOne(
          {
            _id: req.params.id,
            EmployerUserName: Employer.UserName,
            HiredTalent: req.params.HiredTalentID,
            Status: "Ongoing",
          },
          (err, job) => {
            if (job) {
              TalentModel.findById(job.HiredTalent, (err, talent) => {
                if (talent) {
                  let factor = 1;
                  req.body.TotalHours ? factor = req.body.TotalHours : factor = 1;
                  Employer.increaseSpent(job.Price * factor);
                  talent.receiveMoney(job.Price * factor);
                  const rating = req.body.EmployerRating;
                  const review = req.body.EmployerReview;
                  req.body = {}; // clear requst body for secure the next update requst
                  req.body.EmployerReview = review;
                  req.body.EmployerRating = rating;
                  req.body.Status = "Done";
                  req.body.EndDate = Date.now();
                  next();
                } else {
                  res.status(404).json({
                    message: "Talent is not hired for this job",
                  });
                }
              });
            } else {
              res.status(404).json({
                message: "Sorry your request can't processed!",
              });
            }
          }
        );
      } else {
        res.status(404).json({
          message: "Employer Username is not correct!",
        });
      }
    }
  );
};

//Find all proposals for a job
exports.findAllProposalsForAJob = async (req, res, next) => {
  JobModel.findById(req.params.id)
    .populate(
      "Proposals.Talent",
      "FirstName LastName UserName ImageURL Title Email"
    )
    .exec((err, job) => {
      if (err || !job) {
        res.status(404).json({
          message: "Please be sure you entered a correct job id",
        });
      } else {
        if (req.params.proposeID) {
          req.body.Proposals = job.Proposals;
          req.body.Status = job.Status;
          next();
        } else {
          if (job.EmployerUserName == req.params.UserName) {
            res.status(200).json({
              Proposals: job.Proposals,
              Status: job.Status,
              Hired: job.HiredTalent,
            });
          } else {
            res.status(401).json({
              message: "This job is not belong to you",
            });
          }
        }
      }
    });
};

//Find a single propose for a job
exports.findAProposeForAJob = async (req, res) => {
  const Propose = req.body.Proposals.find((item) => {
    return item._id.toString() === req.params.proposeID.toString();
  });
  if (!Propose)
    res.status(404).json({
      message: "Please be sure you entered a correct propose id",
    });
  if (Propose) {
    if (job.EmployerUserName == req.params.UserName) {
      res.status(200).send({
        Propose,
        Status: req.body.Status,
      });
    } else {
      res.status(401).json({
        message: "This job is not belong to you",
      });
    }
  }
};

//Find by ID and remove job from DB
exports.findJobByIDAndRemove = (req, resp) => {
  JobModel.findById(req.params.id, (err, job) => {
    if (job) {
      if (req.params.UserName == job.EmployerUserName) {
        JobModel.findByIdAndRemove(
          req.params.id,
          {
            useFindAndModify: false,
          },
          (err, data) => {
            if (err || !data) {
              resp.status(404).json({
                message: "Job ID is not correct!",
              });
            } else {
              EmployerModel.findOne({
                UserName: data.EmployerUserName,
              }).then((employer) => {
                employer.removeFromJobs(data._id);
              });
              resp.status(200).json({
                message: "Job deleted successfully",
              });
            }
          }
        );
      } else {
        resp.status(401).json({
          message: "You Can't delete a job doesn't belong to you",
        });
      }
    }
    if (err || !job) {
      resp.status(404).json({
        message: "Job ID is not correct!",
      });
    }
  });
};
