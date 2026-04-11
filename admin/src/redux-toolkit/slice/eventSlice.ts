import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface eventType {
    eventList : any[];
}

const initialState:eventType = {
  eventList : []
};


const eventSlice = createSlice({
    name:"Event",
    initialState,
    reducers:{
        setEventList : (state, action:PayloadAction<Event[]>) => {
          state.eventList = action.payload;
        }
    }
});

export const {setEventList} = eventSlice.actions;

export default eventSlice.reducer;

