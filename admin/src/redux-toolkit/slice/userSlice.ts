import {createSlice, PayloadAction} from "@reduxjs/toolkit";


const initialState =  {
    userList : [],
    userCount:0,
    adminData:null,
    businessList:[]

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
        },
       
        setBusinessList:(state, action)=>{
          state.userList = action.payload;
        },

    }
});

export const {setUserList, setUserCount, setAdminData, setBusinessList} = userSlice.actions;

export default userSlice.reducer;