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
            if (state.userData?._id === action.payload?.user?._id || state?.userData?._id === action.payload?._id) {
                state.userData = action.payload?.user || action.payload;
            }
        },

        setRemoveUser:(state, action) => {
            state.userList = state.userList.filter((u) => u?._id !== action.payload?._id)
        },

        setRecoverUser: (state, action) => {
    const exists = state.userList.some( (u) => u._id === action.payload._id);

    if (!exists) {
        state.userList.push(action.payload);
    }
}
    }
});

export const { setUserList,setRemoveUser,setRecoverUser,   setUserCount, setUserData, setUpdateUser } = userSlice.actions;

export default userSlice.reducer;