import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface eventType {
    eventList : any[];
}

type ToggleInterestPayload = {
  eventId: string;
  userId: string;
};

const initialState:eventType = {
  eventList : []
};


const eventSlice = createSlice({
    name:"Event",
    initialState,
    reducers:{
        setEventList : (state, action:PayloadAction<Event[]>) => {
          state.eventList = action.payload;
        },

       setInterestedOrNotInterestedCandidate: (state, action:PayloadAction<ToggleInterestPayload>) => {
  const { eventId, userId } = action.payload;

  const event = state.eventList.find((e) => e._id === eventId);

  if (event) {
    const index = event.interestedCandidate?.indexOf(userId);

    if (index > -1) {
      // ❌ remove (already exists)
      event.interestedCandidate.splice(index, 1);
    } else {
      // ✅ add (not exists)
      if (!event.interestedCandidate) {
        event.interestedCandidate = [];
      }
      event.interestedCandidate.push(userId);
    }
  }
}
    }
});

export const {setEventList, setInterestedOrNotInterestedCandidate} = eventSlice.actions;

export default eventSlice.reducer;

