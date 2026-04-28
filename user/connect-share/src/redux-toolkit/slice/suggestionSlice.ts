import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    suggestionList: []
};


const suggestionSlice = createSlice({
    name: "Suggestion",
    initialState,
    reducers: {
        setSuggestionList: (state, action: PayloadAction<any[]>) => {
            state.suggestionList = action.payload;
        },

        setNewSuggestion: (state, action) => {
            state.suggestionList.unshift(action.payload);
        },

        setUpdateSuggestion: (state, action) => {
            state.suggestionList = state.suggestionList.map((item) => item._id.toString() === action.payload._id.toString() ? action.payload : item);
        }
    }
});

export const { setSuggestionList, setNewSuggestion, setUpdateSuggestion } = suggestionSlice.actions;

export default suggestionSlice.reducer;

