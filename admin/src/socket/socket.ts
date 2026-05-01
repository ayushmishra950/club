// import {io} from "socket.io-client";

// const socket = io(import.meta.env.VITE_BACKEND_SOCKET_URL, 
//     {   
//         auth:{
//             token: localStorage.getItem("accessToken") || ""
//         },
//         autoConnect:true,
//         reconnection:true
//     }
// );

// export default socket;














import { io } from "socket.io-client";
import api from "@/api/axios";

const socket = io(import.meta.env.VITE_BACKEND_SOCKET_URL, {
  auth: {
    token: localStorage.getItem("accessToken") || ""
  },
  autoConnect: true,
  reconnection: true
});

let isRefreshing = false;

socket.on("connect_error", async (err) => {
  try {
    if (err.message?.includes("TokenExpired") && !isRefreshing) {
      isRefreshing = true;
      console.log("Token expired → attempting refresh");

      const res = await api.post("/user/auth/refresh", {}, {
        withCredentials: true 
      });
  
      const newToken = res.data.accessToken;

      localStorage.setItem("accessToken", newToken);

      socket.disconnect();
      (socket.auth as { token: string }).token = newToken;
      socket.connect();

      isRefreshing = false;
    }
  } catch (error) {
    isRefreshing = false;
    console.log("Refresh failed → user logout needed");
  }
});

export default socket;