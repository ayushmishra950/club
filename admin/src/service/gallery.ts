
import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


//=====================================admin k liye hai y===========================================
//==================================================================================================

export const addGallery = async(obj:any) =>{
    const res = await api.post(`${base_url}/admin/gallery/add`, obj,
          { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res;
};


export const getAllGallery = async() =>{
    const res = await api.get(`${base_url}/admin/gallery/get`);
    return res;
};


export const updateGallery = async(obj:any) =>{
    const res = await api.put(`${base_url}/admin/gallery/update`, obj,
          { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res;
};

export const removeGallery = async(id:string) =>{
    const res = await api.delete(`${base_url}/admin/gallery/delete/${id}`);
    return res;
};



export const markAndUnMarkGallery = async(id:string) =>{
    const res = await api.patch(`${base_url}/admin/gallery/marked`, {galleryId:id});
    return res;
};

