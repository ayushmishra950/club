import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;

export const addNews = async(obj:any) => {
    const res = await api.post(`${base_url}/admin/news/add`,obj);
    return res;
};



export const getNews = async() => {
    const res = await api.get(`${base_url}/admin/news/get`);
    return res;
};


export const getByIdNews = async(id:string) => {
    const res = await api.get(`${base_url}/admin/news/getbyid/${id}`);
    return res;
};



export const updateNews = async(obj:any) => {
    const res = await api.put(`${base_url}/admin/news/update`,obj);
    return res;
};



export const deleteNews = async(id:string) => {
    const res = await api.delete(`${base_url}/admin/news/delete/${id}`);
    return res;
};

