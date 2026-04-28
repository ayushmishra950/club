import api from "@/api/axios";

const base_url = import.meta.env.VITE_BACKEND_URL;


//=====================================admin k liye hai y===========================================
//==================================================================================================


export const getDashboardSummary = async () => {
    const res = await api.get(`${base_url}/admin/dashboard/summary`);
    return res;
};



export const getDashboardGraph = async () => {
    const res = await api.get(`${base_url}/admin/dashboard/graph`);
    return res;
};




export const getDashboardStats = async () => {
    const res = await api.get(`${base_url}/admin/dashboard/stats`);
    return res;
}




export const getYearlyAnalytics = async () => {
    const res = await api.get(`${base_url}/admin/dashboard/analytics`);
    return res;
};
