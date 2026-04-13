import {createSlice, PayloadAction} from "@reduxjs/toolkit";


const initialState =  {
    userList : [],
    userCount:0,
    adminData:null

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

        setAdminData: (state, action) => {
            state.adminData = action.payload;
        }
    }
});

export const {setUserList, setUserCount, setAdminData} = userSlice.actions;

export default userSlice.reducer;