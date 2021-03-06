// Import mongoose (MongoDB ODM)
const mongoose = require("mongoose");

//Using mongoose Shcema constructor to create Talents (Freelancers) Schema
const talentSchema = new mongoose.Schema({
	Email: {
		type: String,
		unique: true,
		required: true,
		// match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
	},
	UserName: {
		type: String,
		unique: true,
		required: true,
	},
	FirstName: {
		type: String,
		required: true,
	},
	LastName: {
		type: String,
		required: true,
	},
	Password: {
		type: String,
		required: true,
		minLength: 6,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	MainService: {
		type: String,
	},
	Skills: {
		type: Array,
		default: [],
	},
	ExpertiseLevel: {
		type: String,
		enum: ["Entry", "Intermediate", "Expert"],
		default: "Entry",
	},
	EnglishProficiency: {
		type: Object,
		enum: ["Basic", "Conversational", "Fluent", "Native or Bilingual"],
		default: "Basic",
	},
	HourlyRate: {
		type: Number,
		default: 10,
	},

	Title: {
		type: String,
	},

	ProfessionalOverview: {
		type: String,
	},

	ImageURL: {
		type: String,
		default: "uploads/avatar.png",
	},

	Country: {
		type: String,
		default: "Egypt",
	},

	PhoneNumber: {
		type: Number,
		unique: true,
		sparse: true,
	},

	Availability: {
		type: String,
		enum: [
			"Available as needed",
			"Less Than 30 hrs/week",
			"More Than 30 hrs/week",
		],
		default: "Available as needed",
	},
	Jobs: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Job",
		required: true,
	}, ],
	SavedJobs: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Job",
		required: true,
	}, ],
	Connects: {
		type: Number,
		default: 0,
		min: 0,
	},
	Type: {
		type: String,
		default: "Talent",
	},
	Proposals: [{
		Job: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Job",
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
	}, ],
	Earnings: {
		type: Number,
		default: 0,
		min: 0,
	},
}, {
	timestamps: true,
});
// talentSchema.index({PhoneNumber: 1}, {unique: true, sparse: true});

// Add Method into Talent Schema to add new job
talentSchema.methods.addToJobs = function (job) {
	const updatedJobsList = [...this.Jobs];

	updatedJobsList.push(job._id);

	this.Jobs = updatedJobsList;

	return this.save();
};

// Add Method into Talent Schema to remove a job
talentSchema.methods.removeFromJobs = function (jobID) {
	const updatedlist = this.Jobs.filter((item) => {
		return item.toString() !== jobID.toString();
	});

	this.Jobs = updatedlist;

	return this.save();
};

// Add Method into Talent Schema to deduct connects
talentSchema.methods.deductFromConnects = function (num) {
	this.Connects -= num;

	return this.save();
};

// Add Method into Talent Schema to add new job to saved collection
talentSchema.methods.addToSavedJobs = function (job) {
	const updatedSavedJobsList = [...this.SavedJobs];

	updatedSavedJobsList.push(job._id);

	this.SavedJobs = updatedSavedJobsList;

	return this.save();
};

// Add Method into Talent Schema to remove a job from saved collection
talentSchema.methods.removeFromSavedJobs = function (jobID) {
	const updatedlist = this.SavedJobs.filter((item) => {
		return item.toString() !== jobID.toString();
	});

	this.SavedJobs = updatedlist;

	return this.save();
};

// Return talents connects after accepted in a job
talentSchema.methods.returnConnects = function (connectsNumber) {
	this.Connects += connectsNumber;

	return this.save();
};

// Add Method into talent Schema to add new proposal
talentSchema.methods.addToProposals = function (jobID, coverLetter) {
	const updatedProposalsList = [...this.Proposals];
	const newPropose = {
		Job: jobID,
		CoverLetter: coverLetter,
	};
	updatedProposalsList.push(newPropose);

	this.Proposals = updatedProposalsList;

	return this.save();
};

// Add Method into talent Schema to receive money after end an job
talentSchema.methods.receiveMoney = function (price) {
	const amount = 0.8 * price
	this.Earnings += amount;
	return this.save();
};

// Export the Talents Schema so we can use it whenever we want
module.exports = mongoose.model("Talent", talentSchema);