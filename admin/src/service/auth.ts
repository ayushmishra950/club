import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;

export const registerUser = async(obj:any) => {
   const res  = await api.post(`${base_url}/user/auth/register`, obj);
   return res;
};


export const loginUser = async(obj:any) => {
    const res = await api.post(`${base_url}/user/auth/login`, obj);
    return res;
}



export const updateUser = async (obj: any) => {
    const res = await api.put(`${base_url}/user/auth/update`, obj);
    return res;
}



export const getSingleUser = async (id:string) => {
    const res = await api.get(`${base_url}/user/auth/getbyid/${id}`);
    return res;
}




//=====================================admin k liye hai y===========================================
//==================================================================================================

export const loginAdmin = async(obj:any) => {
    const res = await api.post(`${base_url}/admin/auth/login`, obj);
    return res;
}




export const getAllUser = async ({ page, perPage, search }) => {
    const res = await api.get(`${base_url}/admin/user/get`, { params: { page, perPage, search } });
    return res;
}


export const verifyUser = async (id: string) => {
    const res = await api.patch(`${base_url}/admin/user/verify/${id}`);
    return res;
}



export const verifyBusinessUser = async (obj:any) => {
    const res = await api.post(`${base_url}/admin/user/business/verify`, obj);
    return res;
}



export const deletedUser = async (id: string) => {
    const res = await api.delete(`${base_url}/admin/user/delete/${id}`);
    return res;
}

