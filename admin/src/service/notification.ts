
import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;

export const getAllNotifications = async() => {
    const res = await api.get(`${base_url}/admin/notification/get`);
    return res;
};

