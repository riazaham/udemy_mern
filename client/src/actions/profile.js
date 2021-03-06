import axios from "axios";
import { setAlert } from "./alert";

import {
	CLEAR_PROFILE,
	DELETE_ACCOUNT,
	GET_PROFILE,
	GET_PROFILES,
	PROFILE_ERROR,
	UPDATE_PROFILE,
	GET_REPOS,
} from "./types";

//Get current user's profile
export const getCurrentProfile = () => async (dispatch) => {
	try {
		const res = await axios.get("/api/profile/me");

		dispatch({
			type: GET_PROFILE,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Get all profiles
export const getProfiles = () => async (dispatch) => {
	//Prevent flashing of past user's profile
	dispatch({ type: CLEAR_PROFILE });

	try {
		const res = await axios.get("/api/profile");

		dispatch({
			type: GET_PROFILES,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Get profile by id
export const getProfileById = (user_id) => async (dispatch) => {
	try {
		const res = await axios.get(`/api/profile/user/${user_id}`);

		dispatch({
			type: GET_PROFILE,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Get github repos
export const getGithubRepos = (username) => async (dispatch) => {
	try {
		const res = await axios.get(`/api/profile/github/${username}`);

		dispatch({
			type: GET_REPOS,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

// Create or update profile
export const createProfile =
	(formData, history, edit = false) =>
	async (dispatch) => {
		try {
			const config = {
				headers: {
					"Content-Type": "application/json",
				},
			};

			const res = await axios.post("/api/profile", formData, config);

			dispatch({
				type: GET_PROFILE,
				payload: res.data,
			});

			dispatch(
				setAlert(edit ? "Profile Updated" : "Profile Created", "success")
			);

			//Cannot use redirect because this is not a react component
			if (!edit) {
				history.push("/dashboard");
			}
		} catch (err) {
			const errors = err.response.data.errors;

			if (errors) {
				errors.forEach((error) => {
					dispatch(setAlert(error.msg, "danger"));
				});
			}

			dispatch({
				type: PROFILE_ERROR,
				payload: {
					msg: err.response.statusText,
					status: err.response.status,
				},
			});
		}
	};

//Add Experience
export const addExperience = (formData, history) => async (dispatch) => {
	try {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};

		console.log("Fetching profile...");
		const res = await axios.put("/api/profile/experiences", formData, config);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data,
		});

		dispatch(setAlert("Experience Added", "success"));

		history.push("/dashboard");
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => {
				dispatch(setAlert(error.msg, "danger"));
			});
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Delete Experience
export const deleteExperience = (exp_id) => async (dispatch) => {
	try {
		const res = await axios.delete(`api/profile/experiences/${exp_id}`);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data,
		});

		dispatch(setAlert("Experience Removed", "success"));
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Add Education
export const addEducation = (formData, history) => async (dispatch) => {
	try {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};

		const res = await axios.put("/api/profile/education", formData, config);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data,
		});

		dispatch(setAlert("Education Added", "success"));

		history.push("/dashboard");
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => {
				dispatch(setAlert(error.msg, "danger"));
			});
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Delete Education
export const deleteEducation = (edu_id) => async (dispatch) => {
	try {
		const res = await axios.delete(`api/profile/education/${edu_id}`);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data,
		});

		dispatch(setAlert("Education Removed", "success"));
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status,
			},
		});
	}
};

//Delete account & profile
export const deleteAccount = () => async (dispatch) => {
	if (window.confirm("Are you sure? This can NOT be undone")) {
		try {
			await axios.delete(`/api/profile`);

			dispatch({ type: CLEAR_PROFILE });
			dispatch({ type: DELETE_ACCOUNT });

			dispatch(setAlert("Your account has been permanently removed"));
		} catch (err) {
			dispatch({
				type: PROFILE_ERROR,
				payload: {
					msg: err.response.statusText,
					status: err.response.status,
				},
			});
		}
	}
};
