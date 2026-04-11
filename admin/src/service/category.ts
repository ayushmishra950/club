

import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


export const addCategory = async(obj:any) =>{
    const res = await api.post(`${base_url}/admin/category/add`, obj);
    return res;
};



export const getAllCategory = async() =>{
    const res = await api.get(`${base_url}/admin/category/get`);
    return res;
};



//=====================================admin k liye hai y===========================================
//==================================================================================================


export const updateCategory = async(obj:any) =>{
    const res = await api.put(`${base_url}/admin/category/update`, obj);
    return res;
};



export const deleteCategory = async(id:string) =>{
    const res = await api.delete(`${base_url}/admin/category/delete/${id}`, );
    return res;
};
