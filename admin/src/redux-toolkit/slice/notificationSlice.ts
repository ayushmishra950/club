import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
  notificationList : []
};


const notificationSlice = createSlice({
    name:"Notification",
    initialState,
    reducers:{
        setNotificationList : (state, action) => {
          state.notificationList = action.payload;
        }
    }
});


export const {setNotificationList} = notificationSlice.actions;

export default notificationSlice.reducer;
