import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


export const addMessage = async(obj:any) =>{
    const res = await api.post(`${base_url}/admin/chat/group/message`, obj,
        {headers:{"Content-Type":"multipart/form-data"}}
    );
    return res;
};



export const getAllMessage = async(id:string) =>{
    const res = await api.get(`${base_url}/admin/chat/group/get/messages/${id}`
    );
    return res;
};