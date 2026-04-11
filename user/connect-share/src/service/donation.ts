import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


//=====================================admin k liye hai y===========================================
//==================================================================================================


export const addDonation = async (obj: any) => {
    const res = await api.post(`${base_url}/admin/donation/add`, obj);
    return res;
}


export const getDonation = async (obj: any) => {
    const res = await api.get(`${base_url}/admin/donation/get`, { params: obj });
    return res;
}



export const getTopDonation = async (limit: number) => {
    const res = await api.get(`${base_url}/admin/donation/top-donors`, { params: { limit } });
    return res;
};
