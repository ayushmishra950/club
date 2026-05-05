// import {io} from "socket.io-client";
// import api from "@/api/axios";

// const base_url = import.meta.env.VITE_BACKEND_URL;


// const socket = io(import.meta.env.VITE_BACKEND_SOCKET_URL,
//     { 
//         auth:{
//             token: localStorage.getItem("accessToken") || ""
//         },
//     autoConnect:true,
//     reconnection:true
// });


// socket.on("connect_error", async (err) => {
//   if (err.message === "TokenExpired") {
    
//     // 1. refresh API call (same axios logic reuse karo)
//     const res = await api.post(`/user/auth/refresh`, {}, { withCredentials: true });
 
//     const newToken = res.data.accessToken;

//     // 2. store in localStorage (THIS is your answer)
//     localStorage.setItem("accessToken", newToken);

//     // 3. update socket auth
//     socket.auth.token = newToken;

//     // 4. reconnect socket
//     socket.connect();
//   }
// });

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