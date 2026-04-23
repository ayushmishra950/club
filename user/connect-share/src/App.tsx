import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {HashRouter, BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import socket from "./socket/socket.ts";
import AnnouncementPage from "@/pages/Announcement.tsx";
import { useEffect } from "react";

const queryClient = new QueryClient();
const accessToken = localStorage.getItem("accessToken");
const user = JSON.parse(localStorage.getItem("user"));

const App = () => {
  useEffect(()=>{
    if(user && user?._id){
  socket.emit("joinRoom", user?._id);
    }
  }, [user]);
  return(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <ConnectionProvider>
          <Routes>
            <Route path="/" element={accessToken? <Navigate to="/home" replace /> : <Navigate replace to="/login" />} />
              <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Index />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/events" element={<Events />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:groupId" element={<GroupDetails />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/friends" element={<FriendRequests />} />
            <Route path="/announcements" element={<AnnouncementPage />} />
            <Route path="/userDialog/:id" element={<UserDialog />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ConnectionProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
)};

export default App;
