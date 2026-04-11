import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;



export const getAllNotifications = async(userId:string) =>{
            const res = await api.get(`${base_url}/user/notification/get/${userId}`);
            return res;
};



export const getDeleteNotifications = async(userId:string) =>{
            const res = await api.delete(`${base_url}/user/notification/delete/${userId}`);
            return res;
};