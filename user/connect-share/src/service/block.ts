

import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


export const blockAndUnBlockUser = async (id: string) => {
    const res = await api.patch(`${base_url}/admin/user/block/toggle/${id}`);
    return res;
}


export const getBlockedUsers = async(userId:string) => {
    const res = await api.get(`${base_url}/user/block/get/${userId}`);
    return res;
}



export const unblockedUser = async(obj) => {
    const res = await api.patch(`${base_url}/user/block/unblocked`, obj);
    return res;
}