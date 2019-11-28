import * as actionTypes from '../actions/actionTypes';

const initialState = {
    token: null,
    userId: null,
    userName: null,
    error: {
        email: null,
        credential: null
    }
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
                userId: action.userId,
                userName: action.userName,
                error: {
                    email: null,
                    credential: null
                }
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