
import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;

//======================================user k liye hai y=========================================
//================================================================================================



export const addSuggestion = async (obj: any) => {
    const res = await api.post(`${base_url}/user/suggestion/add`, obj);
    return res;
}



export const getAllSuggestion = async (id: string) => {
    const res = await api.get(`${base_url}/user/suggestion/get/${id}`);
    return res;
}