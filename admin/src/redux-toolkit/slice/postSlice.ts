import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
  postList : []
};


const postSlice = createSlice({
    name:"Posts",
    initialState,
    reducers:{
        setPostList : (state, action) => {
          state.postList = action.payload;
        }
    }
});

export const {setPostList} = postSlice.actions;

export default postSlice.reducer;

