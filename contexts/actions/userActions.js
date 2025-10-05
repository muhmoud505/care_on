import {
    USER_LOGIN_FAIL,
    USER_LOGIN_REQUEST,
    USER_LOGIN_SUCCESS,
    USER_LOGOUT,
    USER_REGISTER_FAIL,
    USER_REGISTER_REQUEST,
    USER_REGISTER_SUCCESS
} from "../constants/userConstants";

export const login=(email,password)=>(dispatch)=>{
    try {
        dispatch({
            type:USER_LOGIN_REQUEST
        });
        const response = fakeAuthAPI(email,password);
        dispatch({
            type:USER_LOGIN_SUCCESS,
            payload:response
        });
    }catch(error){
        dispatch({
            type:USER_LOGIN_FAIL,
            payload:error.response && error.response.data.message
            ?error.response.data.message
            :error.message
        })
    }
}

const fakeAuthAPI=(email,password)=>{
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve({
                _id:'1',
                name:'Mahmoud Hesham',
                email,
                token:'fake-jwt-token'
            })
        },2000)
    })
}

export const register=(email,password,name)=>(dispatch)=>{
    try {
        dispatch({
            type:USER_REGISTER_REQUEST
        })
        const response=fakeResgisterAPI(name,email,password);
        dispatch({
            type:USER_REGISTER_SUCCESS,
            payload:response
        })
        dispatch({
            type:USER_LOGIN_SUCCESS,
            payload:response
        })
    } catch (error) {
        dispatch({
            type:USER_REGISTER_FAIL,
            payload:error.response && error.response.data.message
            ? error.response.data.message
            :error.message
        })
    }
}
const fakeResgisterAPI=(name,email,password)=>{
    return new Promise((resolve)=>{
        setTimeout(() => {
            resolve({
                _id: '1',
                name: name,
                email: email,
                token: 'fake-jwt-token'
           })
        }, 2000);
    })
}
export const logout =()=>(dispatch)=>{
    dispatch({
        type:USER_LOGOUT
    })
}