
import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;

//======================================user k liye hai y=========================================
//================================================================================================



export const getAllSuggestion = async() => {
    const res = await api.get(`${base_url}/admin/suggestion/get`);
    return res;
};


export const deleteSuggestion = async(id:string) => {
    const res = await api.delete(`${base_url}/admin/suggestion/delete/${id}`);
    return res;
}