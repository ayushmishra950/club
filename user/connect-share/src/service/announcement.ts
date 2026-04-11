
import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


export const getAllAnnouncement = async() => {
   const res  = await api.get(`${base_url}/admin/announcement/get`);
   return res;
};



export const getSingleAnnouncement = async(id:string) => {
   const res  = await api.get(`${base_url}/admin/announcement/getbyid/${id}`);
   return res;
};