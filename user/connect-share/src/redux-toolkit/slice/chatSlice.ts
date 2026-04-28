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
    setMessageRefresh: (state, action: PayloadAction<{ newMessage: any, updatedAt: string }>) => {
      const { newMessage, updatedAt } = action.payload;

      if (!newMessage || !newMessage.chatId) return;

      state.userChatList = state.userChatList.map((chat) => {

        if (!chat || !chat.chatId) return chat;

        if (chat.chatId?.toString() === newMessage.chatId?.toString()) {

          const deliveredMessages = Array.isArray(chat.deliveredMessages)
            ? chat.deliveredMessages
            : [];

          const updatedDelivered = deliveredMessages
            .filter((dm) => dm._id?.toString() !== newMessage._id?.toString())
            .concat(newMessage.status !== "seen" ? [newMessage] : []);

          return {
            ...chat,
            lastMessage: newMessage,
            deliveredMessages: updatedDelivered,
            updatedAt: updatedAt ?? new Date().toISOString(),
          };
        }

        return chat;
      });
      state.userChatList = [...state.userChatList].sort(
        (a, b) =>
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime()
      );
    },

    setUnreadCountRemove: (state, action: PayloadAction<{ chat: any }>) => {
      const { chat } = action.payload;

      state.userChatList = state.userChatList.map((c) => {
        if (c.chatId === chat?.chatId) { return { ...c, deliveredMessages: [] }; }
        return c;
      });
    },

    setMessageList: (state, action: PayloadAction<any[]>) => {
      state.messageList = action.payload
    },
    setNewMessageAdd: (state, action: PayloadAction<any>) => {
      state.messageList.push(action.payload);
    }

  }
});

export const { setUserChatList, setMessageRefresh, setUnreadCountRemove, setMessageList, setNewMessageAdd } = chatSlice.actions;

export default chatSlice.reducer;

