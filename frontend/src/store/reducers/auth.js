import * as actionTypes from '../actions/actionTypes';

const initialState = {
    token: null,
    userId: null,
    error: {
        email: null,
        credential: null
    },
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
        case (actionTypes.AUTH_SUCCESS):
            return {
                ...state,
                token: action.idToken,
                userId: action.userId
            }
        case (actionTypes.AUTH_FAIL):
            return {
                ...state,
                error: action.error
            }
        default: 
            return state;
    }
}

export default reducer;