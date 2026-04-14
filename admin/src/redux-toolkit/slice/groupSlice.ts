import {createSlice, PayloadAction} from "@reduxjs/toolkit";


const initialState = {
  groupList : []
};


const groupSlice = createSlice({
    name:"Group",
    initialState,
    reducers:{
        setGroupList : (state, action) => {
          state.groupList = action.payload;
        },

      setAddAnRemoveUserGroup: (state, action) => {
  const { groupId, userId } = action.payload;

  const group = state.groupList.find(g => g._id === groupId);
  if (!group) return;

  const isMember = group.members.some(member => member._id === userId);

  if (isMember) {
    group.members = group.members.filter( member => member._id !== userId);
  } else {
    group.members.push({ _id: userId });
  }
},

   setNewUnReadMessage: (state, action) => {
  const { groupId, newMessage } = action.payload;

  const group = state.groupList?.find(
    (g) => g._id?.toString() === groupId?.toString()
  );

  if (!group) return;

  // ensure array exists
  if (!Array.isArray(group.unreadMessages)) {
    group.unreadMessages = [];
  }

  // avoid duplicate messages (optional but recommended)
  const isAlreadyExists = group.unreadMessages.some(
    (msg) => msg?._id === newMessage?._id
  );

  if (!isAlreadyExists) {
    group.unreadMessages.push(newMessage);
  }
}
    }
});

export const {setGroupList, setAddAnRemoveUserGroup, setNewUnReadMessage} = groupSlice.actions;

export default groupSlice.reducer;

