import axios from "axios";
import { setAlert } from "./alert";
import {
	ADD_POST,
	DELETE_POST,
	GET_POSTS,
	GET_POST,
	POST_ERROR,
	UPDATE_LIKES,
	ADD_COMMENT,
	REMOVE_COMMENT,
} from "./types";

//Get posts
export const getPosts = () => async (dispatch) => {
	try {
		const res = await axios.get("/api/posts");

		dispatch({
			type: GET_POSTS,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Add like
export const addLike = (post_id) => async (dispatch) => {
	try {
		const res = await axios.put(`/api/posts/like/${post_id}`);

		dispatch({
			type: UPDATE_LIKES,
			payload: { post_id, likes: res.data },
		});
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Remove like
export const removeLike = (post_id) => async (dispatch) => {
	try {
		const res = await axios.put(`/api/posts/unlike/${post_id}`);

		dispatch({
			type: UPDATE_LIKES,
			payload: { post_id, likes: res.data },
		});
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Delete post
export const deletePost = (post_id) => async (dispatch) => {
	try {
		const res = await axios.delete(`/api/posts/${post_id}`);

		dispatch({
			type: DELETE_POST,
			payload: post_id,
		});

		dispatch(setAlert("Post Removed", "success"));
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Add post
export const addPost = (formData) => async (dispatch) => {
	const config = {
		headers: {
			"Content-Type": "application/json",
		},
	};

	try {
		const res = await axios.post(`/api/posts/`, formData, config);

		dispatch({
			type: ADD_POST,
			payload: res.data,
		});

		dispatch(setAlert("Post Created", "success"));
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Get post
export const getPost = (post_id) => async (dispatch) => {
	try {
		const res = await axios.get(`/api/posts/${post_id}`);

		dispatch({
			type: GET_POST,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Add comment
export const addComment = (post_id, formData) => async (dispatch) => {
	const config = {
		headers: {
			"Content-Type": "application/json",
		},
	};

	try {
		const res = await axios.post(
			`/api/posts/${post_id}/comments`,
			formData,
			config
		);

		dispatch({
			type: ADD_COMMENT,
			payload: res.data,
		});

		dispatch(setAlert("Comment Added", "success"));
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Delete comment
export const deleteComment = (post_id, comment_id) => async (dispatch) => {
	try {
		const res = await axios.delete(
			`/api/posts/${post_id}/comments/${comment_id}`
		);

		dispatch({
			type: REMOVE_COMMENT,
			payload: comment_id,
		});

		dispatch(setAlert("Comment Removed", "success"));
	} catch (err) {
		dispatch({
			type: POST_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};
