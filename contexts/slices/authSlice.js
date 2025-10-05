//createSlice() auto generate actions and reducer 
//A function that accepts an initial state,
//  an object full of reducer functions, 
// and a "slice name", and automatically generates action 
// creators and action types that correspond to the reducers 
// and state.
import { createSlice } from "@reduxjs/toolkit";

const initialState={
    user:null,
    loading:false,
    error:null
}
const authSlice=createSlice({
    name:'auth',
    initialState,
    reducers:{
        signupStart(state,action){
            state.loading=true;
            state.error=null
        },
        signupSuccess(state,action){
            state.loading=false;
            state.user=action.payload,
            state.error=null
        },
        signupFailure(state,action){
            state.loading=false;
            state.error=action.payload
        }
    }
})
export const {signupStart,signupSuccess,signupFailure}=authSlice.actions;
export default authSlice.reducer;