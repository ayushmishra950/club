import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


//=====================================admin k liye hai y===========================================
//==================================================================================================


export const addEvent = async(obj:any) =>{
    const res = await api.post(`${base_url}/admin/event/add`, obj,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    
    return res;
};


export const getEvent = async() =>{
    const res = await api.get(`${base_url}/admin/event/get`);
    return res;
};


export const getSingleEvent = async(id:string) =>{
    const res = await api.get(`${base_url}/admin/event/getbyid/${id}`);
    return res;
};


export const updateEvent = async(obj:any) =>{
    const res = await api.put(`${base_url}/admin/event/update`, obj,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res;
};

export const deleteEvent = async(id:string) =>{
    const res = await api.delete(`${base_url}/admin/event/delete/${id}`);
    return res;
};


export const interestedOrNotInterestedFromEvent = async(obj:any) =>{
    const res = await api.post(`${base_url}/admin/event/candidate/interested`, obj);
    return res;
};