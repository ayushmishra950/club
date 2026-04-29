// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import {HashRouter, BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { ConnectionProvider } from "@/hooks/useConnections";
// import Index from "./pages/Index.tsx";
// import Profile from "./pages/Profile.tsx";
// import Events from "./pages/Events.tsx";
// import Groups from "./pages/Groups.tsx";
// import GroupDetails from "./pages/GroupDetails.tsx";
// import Directory from "./pages/Directory.tsx";
// import FriendRequests from "./pages/FriendRequests.tsx";
// import NotFound from "./pages/NotFound.tsx";
// import Login from "@/pages/Login.tsx";
// import Register from "@/pages/Register.tsx";
// import UserDialog from "@/components/forms/UserDialog.tsx";
// import socket from "./socket/socket.ts";
// import AnnouncementPage from "@/pages/Announcement.tsx";
// import { useEffect, useState } from "react";

// const queryClient = new QueryClient();

// const App = () => {
//   const [accessToken, setAccessToken] = useState(null);
//   const [user, setUser] = useState(null);
//   useEffect(() => {
//   setAccessToken(localStorage.getItem("accessToken"));
//   setUser(JSON.parse(localStorage.getItem("user")));
// }, []);

//   useEffect(()=>{
//     if(user && user?._id){
//   socket.emit("joinRoom", user?._id);
//     }
//   }, [user]);
//   return(
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <ConnectionProvider>
//           <Routes>
//             <Route path="/" element={accessToken? <Navigate to="/home" replace /> : <Navigate replace to="/login" />} />
//               <Route path="/register" element={<Register />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/home" element={<Index />} />
//             <Route path="/profile/:userId" element={<Profile />} />
//             <Route path="/events" element={<Events />} />
//             <Route path="/groups" element={<Groups />} />
//             <Route path="/groups/:groupId" element={<GroupDetails />} />
//             <Route path="/directory" element={<Directory />} />
//             <Route path="/friends" element={<FriendRequests />} />
//             <Route path="/announcements" element={<AnnouncementPage />} />
//             <Route path="/userDialog/:id" element={<UserDialog />} />

//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </ConnectionProvider>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// )};

// export default App;




















import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConnectionProvider } from "@/hooks/useConnections";

import Index from "./pages/Index.tsx";
import Profile from "./pages/Profile.tsx";
import Events from "./pages/Events.tsx";
import Groups from "./pages/Groups.tsx";
import GroupDetails from "./pages/GroupDetails.tsx";
import Directory from "./pages/Directory.tsx";
import FriendRequests from "./pages/FriendRequests.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "@/pages/Login.tsx";
import Register from "@/pages/Register.tsx";
import UserDialog from "@/components/forms/UserDialog.tsx";
import AnnouncementPage from "@/pages/Announcement.tsx";

import socket from "./socket/socket.ts";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setUpdateSuggestion, incrementUnreadCount } from "@/redux-toolkit/slice/suggestionSlice";

const queryClient = new QueryClient();


// ✅ AUTH HELPERS (simple but effective)
const getToken = () => localStorage.getItem("accessToken");
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};


// 🔐 Protected Route
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


// 🔓 Public Route
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const token = getToken();

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return children;
};


const App = () => {
  const dispatch = useAppDispatch();

  // ✅ socket global join (always safe)
  useEffect(() => {
    const user = getUser();

    if (user?._id) {
      socket.emit("joinRoom", user._id);
    }
  }, []);

  // ✅ GLOBAL SUGGESTION SOCKET LISTENERS (always active, not tied to modal)
  useEffect(() => {
    // ✅ For status changes (data update AND count increment)
    const handleStatusUpdate = (data: any) => {
      if (data?._id) {
        dispatch(setUpdateSuggestion(data));
        dispatch(incrementUnreadCount()); // ✅ Increment for status changes
      }
    };

    // ✅ For replies only (both data update AND count increment)
    const handleReplyUpdate = (data: any) => {
      if (data?._id) {
        dispatch(setUpdateSuggestion(data));
        dispatch(incrementUnreadCount()); // ✅ Increment for replies
      }
    };

    socket.on("updateSuggestionStatus", handleStatusUpdate);
    socket.on("suggestionReply", handleReplyUpdate);

    return () => {
      socket.off("updateSuggestionStatus", handleStatusUpdate);
      socket.off("suggestionReply", handleReplyUpdate);
    };
  }, [dispatch]);


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <HashRouter>
          <ConnectionProvider>

            <Routes>

              {/* default route */}
              <Route
                path="/"
                element={
                  getToken()
                    ? <Navigate to="/home" replace />
                    : <Navigate to="/login" replace />
                }
              />

              {/* PUBLIC ROUTES */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* PROTECTED ROUTES (ALL SECURED) */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <Groups />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/groups/:groupId"
                element={
                  <ProtectedRoute>
                    <GroupDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/directory"
                element={
                  <ProtectedRoute>
                    <Directory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/friends"
                element={
                  <ProtectedRoute>
                    <FriendRequests />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/announcements"
                element={
                  <ProtectedRoute>
                    <AnnouncementPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/userDialog/:id"
                element={
                  <ProtectedRoute>
                    <UserDialog />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>

          </ConnectionProvider>
        </HashRouter>

      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
