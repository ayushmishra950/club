import {createSlice, PayloadAction} from "@reduxjs/toolkit";


const initialState =  {
    userList : [],
    userCount:0,

};


const userSlice = createSlice({
    name:"User",
    initialState,
    reducers:{
        setUserList:(state, action)=>{
          state.userList = action.payload;
        },

        setUserCount:(state, action) => {
            state.userCount = action.payload;
        },
    }
});

export const {setUserList, setUserCount} = userSlice.actions;

export default userSlice.reducer;