import uuid from "uuid/v4";
import { SET_ALERT, REMOVE_ALERT } from "./types";

//dispatch is used here so that more than 1 action can be dispatched at the same time
//such a syntax can be used because of the 'thunk' middleware
export const setAlert =
	(msg, alertType, timeout = 5000) =>
	(dispatch) => {
		const id = uuid();
		dispatch({
			type: SET_ALERT,
			payload: { msg, alertType, id },
		});

		//built-in js function that has a callback fn after a set time
		setTimeout(
			() =>
				dispatch({
					type: REMOVE_ALERT,
					payload: id,
				}),
			timeout
		);
	};
