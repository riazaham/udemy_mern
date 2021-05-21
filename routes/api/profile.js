const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const request = require("request");
const config = require("config");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");

// @route GET api/profile/me
// @desc Get current user's profile from user id
// @access Private - can be accessed only with token
router.get("/me", auth, async (req, res) => {
	try {
		// Find the profile using the user id
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			"user",
			["name", "avatar"]
		);

		if (!profile) {
			return res.status(400).json({ msg: "There is no profile for this user" });
		}

		return res.json(profile);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send("Server Error");
	}
});

// @route GET api/profile
// @desc Create/update user profile
// @access Private - can be accessed only with token
router.post(
	"/",
	[
		auth,
		[
			check("status", "Status is required").not().isEmpty(),
			check("skills", "Skills are required").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body;

		//Build profile object
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills) {
			profileFields.skills = skills.split(",").map((skill) => skill.trim());
		}

		//Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			// Find the profile using user id
			// Mongoose methods need await
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				// Find the record and Update in mongoDB
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields }, //sets the new data
					{ new: true } //return the updated (new) document
				);
				return res.json(profile);
			}

			//If not found, create
			profile = new Profile(profileFields);

			await profile.save();
			return res.json(profile);
		} catch (err) {
			console.error(err.message);
			return res.status(500).send("Server Error");
		}
	}
);

// @route GET api/profile
// @desc Get all profiles
// @access Public
router.get("/", async (req, res) => {
	try {
		// Find the profile using the user id
		const profiles = await Profile.find().populate("user", ["name", "avatar"]);

		return res.json(profiles);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send("Server Error");
	}
});

// @route GET api/profile/user/:user_id
// @desc Get profile by user id
// @access Public
router.get("/user/:user_id", async (req, res) => {
	try {
		// Find the profile using the user id
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate("user", ["name", "avatar"]);

		if (!profile) return res.status(400).json({ msg: "Profile not found" });

		return res.json(profile);
	} catch (err) {
		console.error(err.message);
		if (err.kind == "ObjectId") {
			return res.status(400).json({ msg: "Profile not found" });
		}
		return res.status(500).send("Server Error");
	}
});

// @route DELETE api/profile
// @desc Delete profile, user & posts
// @access Private
router.delete("/", auth, async (req, res) => {
	try {
		//Remove User posts
		await Post.deleteMany({ user: req.user.id });

		// Find the profile using the user id
		// Remove profile
		await Profile.findOneAndRemove({ user: req.user.id });

		// Find use by user id
		// Remove user
		await User.findOneAndRemove({ _id: req.user.id });

		return res.json({ msg: "User deleted" });
	} catch (err) {
		console.error(err.message);
		return res.status(500).send("Server Error");
	}
});

// @route PUT api/profile/experiences
// @desc Add profile experience
// @access Private
router.put(
	"/experiences",
	[
		auth,
		[
			check("title", "Title is required").not().isEmpty(),
			check("company", "Company is required").not().isEmpty(),
			check("from", "From date is required").not().isEmpty(),
		],
	],
	async (req, res) => {
		//Validate the data in the user form
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		//Ddeconstruct the data submitted by user (via form)
		const { title, company, location, from, to, current, description } =
			req.body;

		// if the value is the same as the param name, don't have to set
		// otherwise, 'title: title'
		// create newExp (new experience) object
		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		};

		try {
			//Fetch the profile
			const profile = await Profile.findOne({ user: req.user.id });

			//unshift is the same as push but pushes from the front
			//this is so that the latest entry is on top
			profile.experiences.unshift(newExp);
			await profile.save();
			return res.json(profile);
		} catch (err) {
			console.error(err.message);
			return res.status(500).send("Server Error");
		}
	}
);

// @route DELETE api/profile/experiences/:exp_id
// @desc Add profile experience
// @access Private
router.delete("/experiences/:exp_id", auth, async (req, res) => {
	try {
		//Fetch the profile
		const profile = await Profile.findOne({ user: req.user.id });

		//Get remove index
		const removeIndex = profile.experiences
			.map((item) => item.id)
			.indexOf(req.params.exp_id);

		profile.experiences.splice(removeIndex, 1);

		await profile.save();
		return res.json(profile);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send("Server Error");
	}
});

// @route PUT api/profile/education
// @desc Add profile education
// @access Private
router.put(
	"/education",
	[
		auth,
		[
			check("school", "School is required").not().isEmpty(),
			check("degree", "Degree is required").not().isEmpty(),
			check("fieldofstudy", "Field of study is required").not().isEmpty(),
			check("from", "From date is required").not().isEmpty(),
		],
	],
	async (req, res) => {
		//Validate the data in the user form
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		//Ddeconstruct the data submitted by user (via form)
		const { school, degree, fieldofstudy, from, to, current, description } =
			req.body;

		// if the value is the same as the param name, don't have to set
		// otherwise, 'title: title'
		// create newExp (new experience) object
		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		};

		try {
			//Fetch the profile
			const profile = await Profile.findOne({ user: req.user.id });

			//unshift is the same as push but pushes from the front
			//this is so that the latest entry is on top
			profile.education.unshift(newEdu);
			await profile.save();
			return res.json(profile);
		} catch (err) {
			console.error(err.message);
			return res.status(500).send("Server Error");
		}
	}
);

// @route DELETE api/profile/experiences/:edu_id
// @desc Add profile experience
// @access Private
router.delete("/education/:edu_id", auth, async (req, res) => {
	try {
		//Fetch the profile
		const profile = await Profile.findOne({ user: req.user.id });

		//Get remove index
		const removeIndex = profile.education
			.map((item) => item.id)
			.indexOf(req.params.edu_id);

		profile.education.splice(removeIndex, 1);

		await profile.save();
		return res.json(profile);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send("Server Error");
	}
});

// @route GET api/profile/github/:username
// @desc Get user repos from Github
// @access Public
router.get("/github/:username", (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				"githubClientId"
			)}&client_secret=${config.get("githubSecret")}`,
			method: "GET",
			headers: { "user-agent": "node.js" },
		};

		request(options, (error, response, body) => {
			if (error) console.error(error);

			if (response.statusCode !== 200) {
				return res.status(400).json({ msg: "No github profile found" });
			}

			return res.json(JSON.parse(body));
		});
	} catch (err) {
		console.error(err.message);
		return res.status(500).send("Server Error");
	}
});

module.exports = router;
