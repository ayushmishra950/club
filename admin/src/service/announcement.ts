import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;

export const addAnnouncement = async(obj:any) => {
   const res  = await api.post(`${base_url}/admin/announcement/add`, obj);
   return res;
};



export const getAllAnnouncement = async() => {
   const res  = await api.get(`${base_url}/admin/announcement/get`);
   return res;
};



export const getSingleAnnouncement = async(id:string) => {
   const res  = await api.get(`${base_url}/admin/announcement/getbyid/${id}`);
   return res;
};



export const deleteAnnouncement = async(id:string) => {
   const res  = await api.delete(`${base_url}/admin/announcement/delete/${id}`,);
   return res;
};
