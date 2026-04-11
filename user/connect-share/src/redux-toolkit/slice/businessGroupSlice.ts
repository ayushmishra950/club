import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
  groupList : []
};


const groupSlice = createSlice({
    name:"Group",
    initialState,
    reducers:{
        setGroupList : (state, action:PayloadAction<any[]>) => {
          state.groupList = action.payload;
        },

        setGroupJoinAnUnJoin : (state, action:PayloadAction<any>) => {
          const {groupId, userId, fullName, email, profileImage} = action.payload;
          const groupIndex = state.groupList.findIndex(group => group._id === groupId); 
            if(groupIndex !== -1){
                const memberIndex = state.groupList[groupIndex].members.findIndex(member => member._id === userId);
                if(memberIndex !== -1){
                    state.groupList[groupIndex].members.splice(memberIndex, 1);
                }
                else{
                    state.groupList[groupIndex].members.push({_id:userId, fullName, email, profileImage});
                }
            }
        }
    }
});

export const {setGroupList, setGroupJoinAnUnJoin} = groupSlice.actions;

export default groupSlice.reducer;

