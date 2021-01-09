const express = require("express");
const router = express.Router();
const JobController = require("../controllers/Job");

// get All Jobs
router.get("/", JobController.getAllJobs);

//Get a job by ID
router.get("/:id", JobController.getAJobById);

// create new job and add it to the DB
router.post("/Add", JobController.createNewJob);

//Find job by username and remove from DB
router.delete("/:id", JobController.findJobByUsernameAndRemove);

module.exports = router;
