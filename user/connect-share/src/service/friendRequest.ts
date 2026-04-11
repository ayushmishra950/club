
import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


//=====================================admin k liye hai y===========================================
//==================================================================================================



export const getSuggestedUsers = async(id) => {
    const res = await api.get(`${base_url}/user/friend/suggestion/get/${id}`);
    return res;
};



export const sendRequest = async(obj:any) => {
    const res = await api.post(`${base_url}/user/friend/request/send`, obj);
    return res;
};



export const acceptRequest = async(id:string) => {
    const res = await api.get(`${base_url}/user/friend/request/accept/${id}`);
    return res;
};



export const cancelRequest = async(id:string) => {
    const res = await api.get(`${base_url}/user/friend/request/cancel/${id}`);
    return res;
};



export const pendingRequest = async(id:string) => {
    const res = await api.get(`${base_url}/user/friend/request/pending/${id}`);
    return res;
};



export const getFriendUsers = async(userId:string) => {
    const res = await api.get(`${base_url}/user/friend/users/${userId}`);
    return res;
}


export const getMutualFriends = async(obj:any) =>{
    const res = await api.post(`${base_url}/user/mutualFriends`, obj);
    return res;
}