import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState = {
    userList: [],
    userCount: 0,
    userData: null
};

 
const userSlice = createSlice({
    name: "User",
    initialState,
    reducers: { 
        setUserList: (state, action) => {
            state.userList = action.payload;
        },

        setUserCount: (state, action) => {
            state.userCount = action.payload;
        },
        setUserData: (state, action) => {
            state.userData = action.payload;
        },

        setUpdateUser: (state, action) => {
            if (state.userData?._id === action.payload?.user?._id) {
                state.userData = action.payload?.user;
            }
        }
    }
}); 

export const { setUserList, setUserCount, setUserData, setUpdateUser } = userSlice.actions;

export default userSlice.reducer;