
import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


export const createBusinessGroup = async(obj:any) => {
    const res = await api.post(`${base_url}/admin/businessgroup/add`, obj);
    return res;
};

export const getAllBusinessGroups = async() => {
    const res = await api.get(`${base_url}/admin/businessgroup/get`);
    return res;
};

export const getBusinessGroupById = async(id: string) => {
    const res = await api.get(`${base_url}/admin/businessgroup/getbyid/${id}`);
    return res; 
};

export const updateBusinessGroup = async(obj:any) => {
    const res = await api.put(`${base_url}/admin/businessgroup/update`, obj);
    return res;
};

export const deleteBusinessGroup = async(id: string) => {
    const res = await api.delete(`${base_url}/admin/businessgroup/delete/${id}`);
    return res;
};