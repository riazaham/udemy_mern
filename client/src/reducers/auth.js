import {
	REGISTER_SUCCESS,
	REGISTER_FAIL,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	USER_LOADED,
	AUTH_ERROR,
	LOGOUT,
	DELETE_ACCOUNT,
} from "../actions/types";

const initialState = {
	token: localStorage.getItem("token"),
	//set it to true once user is logged in
	//experiment with false instead of null
	isAuthenticated: null,
	//set it to false once data has been retrieved from db
	//regardless of success or fail
	loading: true,
	user: null,
};

export default function authState(state = initialState, action) {
	const { type, payload } = action;

	switch (type) {
		case USER_LOADED:
			return {
				...state,
				isAuthenticated: true,
				loading: false,
				user: payload,
			};
		case REGISTER_SUCCESS:
		case LOGIN_SUCCESS:
			localStorage.setItem("token", payload.token);
			return {
				...state,
				...payload,
				isAuthenticated: true,
				loading: false,
			};
		case REGISTER_FAIL:
		case LOGIN_FAIL:
		case LOGOUT:
		case AUTH_ERROR:
		case DELETE_ACCOUNT:
			localStorage.removeItem("token");
			return {
				...state,
				token: null,
				isAuthenticated: false,
				loading: false,
			};
		default:
			return state;
	}
}
