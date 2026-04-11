

import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


export const roleAssign = async (obj: any) => {
    const res = await api.patch(`${base_url}/admin/user/role/assign`, obj);
    return res;
}