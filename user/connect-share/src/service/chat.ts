import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


export const getChatUsers = async (userId: string) => {
    const res = await api.get(`${base_url}/user/chat/users/${userId}`);
    return res;
};


export const addUserFromChat = async (obj) => {
    const res = await api.post(`${base_url}/user/chat/user/add`, obj);
    return res;
};


export const sendMessage = async (obj) => {
    const res = await api.post(`${base_url}/user/chat/message/send`, obj,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res;
};

export const getMessages = async (chatId: string) => {
    const res = await api.get(`${base_url}/user/chat/messages/${chatId}`);
    return res;
}

export const rejectGroupInvite = async (obj) => {
    const res = await api.post(`${base_url}/user/chat/user/reject-group-invite`, obj);
    return res;
}


export const acceptGroupInvite = async (obj) => {
    const res = await api.post(`${base_url}/user/chat/user/accept-group-invite`, obj);
    return res;
};




export const blockUser = async (obj) => {
    const res = await api.patch(`${base_url}/user/chat/user/block`, obj);
    return res;
};



export const unblockUser = async (obj) => {
    const res = await api.patch(`${base_url}/user/chat/user/unblock`, obj);
    return res;
};
