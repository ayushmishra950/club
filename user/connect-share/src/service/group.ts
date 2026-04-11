import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


export const getAllGroups = async() =>{
            const res = await api.get(`${base_url}/user/group/get`);
            return res;
};


export const toggleMember = async(obj:any) => {
 const res = await api.post(`${base_url}/user/group/toggle-member`, obj);
            return res;
}