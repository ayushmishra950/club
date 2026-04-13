import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
  suggestionList : []
};


const suggestionSlice = createSlice({
    name:"Suggestions",
    initialState,
    reducers:{
        setSuggestionList : (state, action) => {
          state.suggestionList = action.payload;
        },

        setNewSuggestion: (state, action) => {
        state.suggestionList.unshift(action.payload);
        },

        setDeleteSuggestion: (state, action) => {
            state.suggestionList = state.suggestionList.filter((s)=> s?._id !== action.payload?._id)
        }
    }
});

export const {setSuggestionList, setNewSuggestion, setDeleteSuggestion} = suggestionSlice.actions;

export default suggestionSlice.reducer;

