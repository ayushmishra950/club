import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;

export const addReviews = async(obj:any) => {
    const res = await api.post(`${base_url}/admin/reviews/add`,obj);
    return res;
};

export const getReviews = async() => {
    const res = await api.get(`${base_url}/admin/reviews/get`);
    return res;
};


export const getByIdReview = async(id:string) => {
    const res = await api.get(`${base_url}/admin/reviews/getbyid/${id}`);
    return res;
};



export const updateReviews = async(obj:any) => {
    const res = await api.put(`${base_url}/admin/reviews/update`,obj);
    return res;
};



export const deleteSingleReview = async(id:string) => {
    const res = await api.delete(`${base_url}/admin/reviews/delete/${id}`);
    return res;
};

