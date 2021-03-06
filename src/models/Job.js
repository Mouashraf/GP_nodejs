// Import mongoose (MongoDB ODM)
const mongoose = require("mongoose");

//Using mongoose Shcema constructor to create Job Schema
const jobSchema = new mongoose.Schema(
  {
    EmployerUserName: {
      type: String,
      required: true,
      immutable: true,
    },
    Name: {
      type: String,
      required: true,
    },
    Category: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    JobType: {
      type: String,
      required: true,
      enum: ["One Time", "Ongoing", "Complex"],
    },
    Skills: {
      type: Array,
      default: [],
    },
    ExpertiseLevel: {
      type: String,
      required: true,
      enum: ["Entry", "Intermediate", "Expert"],
    },
    TalentsRequired: {
      type: Number,
      required: true,
      default: 1,
    },
    Country: {
      type: String,
      default: "",
    },
    EnglishLevel: {
      type: String,
      enum: ["", "Basic", "Good", "Fluent", "Native"],
      default: "",
    },
    PaymentType: {
      type: String,
      required: true,
      enum: ["Fixed Price", "Hourly"],
    },
    Price: {
      type: Number,
      required: true,
    },
    Duration: {
      type: String,
      enum: ["Less than one month", "1 to 3 months", "3 to 6 months", "More than 6 months"],
      default: "Less than one month",
    },
    WeeklyHoursRequired: {
      type: String,
      enum: [
        "Less Than 30 hrs/week",
        "More Than 30 hrs/week",
      ],
      default: "Less Than 30 hrs/week",
    },
    EmployerRating: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5],
    },
    EmployerReview: {
      type: String,
    },
    HiredTalent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Talent",
    },
    TalentRating: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5],
    },
    TalentReview: {
      type: String,
    },
    Proposals: [
      {
        Talent: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Talent",
          required: true,
        },
        CoverLetter: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    TotalProposal: {
      type: Number,
      default: 0,
    },
    ConnectsNeeded: {
      type: Number,
      default: 3,
    },
    Status: {
      type: String,
      enum: ["Pending", "Ongoing", "Done"],
      default: "Pending",
    },
    StartDate: {
      type: Date
    },
    EndDate: {
      type: Date
    },
  },
  {
    timestamps: true,
  }
);

// Add Method into job Schema to add new proposal
jobSchema.methods.addToProposals = function (talentID, coverLetter) {
  const updatedProposalsList = [...this.Proposals];
  const newPropose = {
    Talent: talentID,
    CoverLetter: coverLetter,
  };
  updatedProposalsList.push(newPropose);

  this.Proposals = updatedProposalsList;
  this.TotalProposal++;

  return this.save();
};

// Export the Jobs Schema so we can use it whenever we want
module.exports = mongoose.model("Job", jobSchema);
