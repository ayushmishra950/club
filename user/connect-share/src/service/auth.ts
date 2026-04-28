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
    const res = await api.put(`${base_url}/user/auth/update`, obj, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    return res;
}



export const getSingleUser = async (id:string) => {
    const res = await api.get(`${base_url}/user/auth/getbyid/${id}`);
    return res;
}


export const getAllUser = async () => {
    const res = await api.get(`${base_url}/user/auth/get`);
    return res;
};



export const convertPremiumUser = async (obj: any) => {
    const res = await api.put(`${base_url}/user/auth/convert-premium`, obj,
        {
            headers:{
                "Content-Type": "multipart/form-data",
            }
        }
    );
    return res;
};
