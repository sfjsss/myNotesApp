import * as actionTypes from '../actions/actionTypes';

const initialState = {
    token: null,
    userId: null,
    error: null,
    loading: false,
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case (actionTypes.AUTH_LOGOUT):
            return {
                ...state,
                token: null,
                userId: null
            }
        default: 
            return state;
    }
}

export default reducer;