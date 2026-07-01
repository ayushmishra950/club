
import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;

//======================================user k liye hai y=========================================
//================================================================================================


export const addNotes = async(obj) =>{
    const res = await api.post(`${base_url}/user/post/notes/add`, obj,
    );
    return res;
};


export const likeAnUnLikePost = async(obj) =>{
    const res = await api.post(`${base_url}/user/post/like/toggle`, obj,
    );
    return res;
};


export const addCommentPost = async(obj) =>{
    const res = await api.post(`${base_url}/user/post/comment/add`, obj,
    );
    return res;
};


export const likeAnUnLikeComment = async(obj) =>{
    const res = await api.post(`${base_url}/user/post/comment/like-toggle`, obj,
    );
    return res;
};


export const replyToComment = async(obj) =>{
    const res = await api.post(`${base_url}/user/post/comment/reply`, obj,
    );
    return res;
};



export const sharePost = async(obj) =>{
    const res = await api.post(`${base_url}/user/post/share`, obj,
    );
    return res;
};



export const deletePostByUser = async(obj) =>{
    const res = await api.put(`${base_url}/user/post/delete`, obj,
    );
    return res;
}


//=====================================admin k liye hai y===========================================
//==================================================================================================




export const addPost = async(obj) =>{
    const res = await api.post(`${base_url}/admin/post/add`, obj,
          { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res;
};


export const getAllPost = async(userId: string) =>{
    const res = await api.get(`${base_url}/user/post/get/${userId}`);
    return res;
};



export const updatePost = async(obj) =>{
    const res = await api.put(`${base_url}/admin/post/update`, obj,
          { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res;
};


export const deletePost = async(id:string) =>{
    const res = await api.delete(`${base_url}/admin/post/delete/${id}`, );
    return res;
};


export const deletePostComment = async(id:string) =>{
    const res = await api.delete(`${base_url}/admin/post/delete/${id}`, );
    return res;
};



export const markAndUnMarkPost = async(id:string) =>{
    const res = await api.patch(`${base_url}/admin/post/marked/${id}`);
    return res;
};


