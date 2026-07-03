import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;

export const forgetPassword = async(identifier:string) => {
    console.log(identifier)
    const res = await api.post(`${base_url}/user/password/forgot-password`, { identifier });
    return res;
};


export const updatePassword = async(token:string, newPassword:string) => {
    const res = await api.post(`${base_url}/user/password/reset-password`, { token, newPassword });
    return res;
};