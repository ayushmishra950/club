
import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


export const createGroup = async (obj: any) => {
    const res = await api.post(`${base_url}/admin/group/add`, obj);
    return res;
};

export const getAllGroups = async () => {
    const res = await api.get(`${base_url}/admin/group/get`);
    return res;
};

export const getGroupById = async (id: string) => {
    const res = await api.get(`${base_url}/admin/group/getbyid/${id}`);
    return res;
};

export const updateGroup = async (obj: any) => {
    const res = await api.put(`${base_url}/admin/group/update`, obj);
    return res;
};

export const deleteGroup = async (id: string) => {
    const res = await api.delete(`${base_url}/admin/group/delete/${id}`);
    return res;
};



export const addMemberToGroup = async (obj: any) => {
    const res = await api.post(`${base_url}/admin/group/addmember`, obj);
    return res;
};

export const removeMemberFromGroup = async (obj: any) => {
    const res = await api.put(`${base_url}/admin/group/removemember`, obj);
    return res;
};   