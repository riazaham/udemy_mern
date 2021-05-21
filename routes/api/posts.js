const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route POST api/posts
// @desc Create post
// @access Private - must be logged in to create a post
router.post(
	"/",
	[auth, [check("text", "Text is required").not().isEmpty()]],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			//Fetch user
			const user = await User.findById(req.user.id).select("-password");

			//Create new post
			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});

			const post = await newPost.save();
			return res.json(post);
		} catch (err) {
			console.error(err.message);
			return res.status(500).send("Server error");
		}
	}
);

// @route GET api/posts
// @desc Get all post
// @access Private
router.get("/", auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		return res.json(posts);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send("Server error");
	}
});

// @route GET api/posts/:id
// @desc Get post by id
// @access Private
router.get("/:id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: "Post not found" });
		}

		return res.json(post);
	} catch (err) {
		console.error(err.message);
		// condition - not a formatted objectID
		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Post not found" });
		}
		return res.status(500).send("Server error");
	}
});

// @route DELETE api/posts/:id
// @desc Delete post by id
// @access Private
router.delete("/:id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		//Check if the post exists
		if (!post) {
			return res.status(404).json({ msg: "Post not found" });
		}

		//Check if the post belongs to the currently logged in user
		//post.user is an ObjectId type
		//req.user.id is a String
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: "User not authorized" });
		}

		console.log(post);
		await post.remove();

		return res.json({ msg: "Post removed" });
	} catch (err) {
		console.error(err.message);
		// condition - not a formatted objectID
		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Post not found" });
		}
		return res.status(500).send("Server error");
	}
});

// @route PUT api/posts/like/:id
// @desc Like a post
// @access Private
router.put("/like/:id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		//Check if post has already been liked by this user
		if (
			post.likes.filter((like) => like.user.toString() === req.user.id).length >
			0
		) {
			return res.status(400).json({ msg: "Post already liked" });
		}

		post.likes.unshift({ user: req.user.id });
		await post.save();
		return res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		// condition - not a formatted objectID
		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Invalid user" });
		}
		return res.status(500).send("Server error");
	}
});

// @route PUT api/posts/unlike/:id
// @desc Unlike a post
// @access Private
router.put("/unlike/:id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		//Check if post has already been liked by this user
		if (
			post.likes.filter((like) => like.user.toString() === req.user.id)
				.length === 0
		) {
			return res.status(400).json({ msg: "Post has not been liked" });
		}

		//Get removeIndex
		const removeIndex = post.likes
			.map((like) => like.user.toString())
			.indexOf(req.user.id);
		post.likes.splice(removeIndex, 1);

		await post.save();
		return res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		// condition - not a formatted objectID
		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Invalid user" });
		}
		return res.status(500).send("Server error");
	}
});

// @route POST api/posts/comments/:id
// @desc Comment on a post
// @access Private
router.post(
	"/:id/comments",
	[auth, [check("text", "Text is required").not().isEmpty()]],
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			//Fetch user
			const user = await User.findById(req.user.id).select("-password");
			const post = await Post.findById(req.params.id);

			//Create new post
			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};

			post.comments.unshift(newComment);
			post.save();
			return res.json(post.comments);
		} catch (err) {
			console.error(err.message);
			return res.status(500).send("Server error");
		}
	}
);

// @route DELETE api/posts/:post_id/comments/:id
// @desc Delete a comment on a post
// @access Private
router.delete("/:post_id/comments/:id", auth, async (req, res) => {
	try {
		//Fetch user
		const post = await Post.findById(req.params.post_id);

		//Fetch comment
		const comment = post.comments.find(
			(comment) => comment.id === req.params.id
		);

		//Check if post exists
		if (!post) {
			return res.status(400).json({ msg: "Post not found" });
		}

		//Check if comment exists
		if (!comment) {
			return res.status(404).json({ msg: "Comment not found" });
		}

		//Check if current user is author of post
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: "User not authorised" });
		}

		//Get removeIndex of comment and remove from list
		const removeIndex = post.comments
			.map((comment) => comment.id)
			.indexOf(req.params.id);

		//Remember to included 1...
		post.comments.splice(removeIndex, 1);

		await post.save();
		return res.json(post.comments);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send("Server error");
	}
});

module.exports = router;
