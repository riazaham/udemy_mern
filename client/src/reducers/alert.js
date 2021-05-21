import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

//action is the data (optional)
export default function alertState(state = initialState, action) {
    
    const { type, payload } = action;

    switch(type) {
        case SET_ALERT:
            // state is immutable hence we use ...
            return [...state, payload];
        case REMOVE_ALERT:
            return state.filter(alert => alert.id !== payload);
        default:
            return state;
    }
}