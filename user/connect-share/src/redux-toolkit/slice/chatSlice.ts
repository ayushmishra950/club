import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  userChatList: [],
  messageList: []
};


const chatSlice = createSlice({
  name: "Chat",
  initialState,
  reducers: {
    setUserChatList: (state, action: PayloadAction<any[]>) => {
      state.userChatList = action.payload;
    },

    setMessageRefresh: (state, action: PayloadAction<{ newMessage: any }>) => {
      const { newMessage } = action.payload;

      if (!newMessage || !newMessage.chatId) return;

      state.userChatList = state.userChatList.map((chat) => {

        if (!chat || !chat.chatId) return chat;

        if (chat.chatId === newMessage.chatId) {

          const deliveredMessages = Array.isArray(chat.deliveredMessages) ? chat.deliveredMessages : [];

          const updatedDelivered = deliveredMessages.filter((dm) => dm._id !== newMessage._id).concat(newMessage.status !== "seen" ? [newMessage] : []);

          return { ...chat, deliveredMessages: [...updatedDelivered] };
        }

        return chat;
      });
    },

    setUnreadCountRemove: (state, action: PayloadAction<{ chat: any }>) => {
      const { chat } = action.payload;

      state.userChatList = state.userChatList.map((c) => {
        if (c.chatId === chat?.chatId) { return { ...c, deliveredMessages: [] }; }
        return c;
      });
    },

    setMessageList: (state, action:PayloadAction<any[]>) => {
      state.messageList = action.payload
    },
    setNewMessageAdd: (state,action:PayloadAction<any>)=>{
      state.messageList.push(action.payload);
    }

  }
});

export const { setUserChatList, setMessageRefresh, setUnreadCountRemove, setMessageList, setNewMessageAdd } = chatSlice.actions;

export default chatSlice.reducer;

