
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
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
import { PublicLayout } from "@/components/PublicLayout.tsx";
import Home from "./pages/Home.tsx";
import About from "./pages/About.tsx";
import PublicEvents from "./pages/PublicEvents.tsx";
import PublicAnnouncements from "./pages/PublicAnnouncements.tsx";
import Contact from "./pages/Contact.tsx";

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


  useEffect(() => {
    const user = getUser();

    if (user?._id) {
      socket.emit("joinRoom", user._id);
    }
  }, []);

  useEffect(() => {
    const handleStatusUpdate = (data: any) => {
      if (data?._id) {
        dispatch(setUpdateSuggestion(data));
        dispatch(incrementUnreadCount());
      }
    };

    const handleReplyUpdate = (data: any) => {
      if (data?._id) {
        dispatch(setUpdateSuggestion(data));
        dispatch(incrementUnreadCount());
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

              <Route path="/" element={getToken() ? <Navigate to="/home" replace /> : <PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="events" element={<PublicEvents />} />
                <Route path="announcements" element={<PublicAnnouncements />} />
                <Route path="contact" element={<Contact />} />
              </Route>

              {/* default route */}
              {/* <Route path="/" element={ getToken() ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} /> */}

              {/* PUBLIC ROUTES */}
              <Route path="/login" element={<PublicRoute>
                <Login />
              </PublicRoute>} />

              <Route path="/register" element={<PublicRoute>
                <Register />
              </PublicRoute>} />

              {/* PROTECTED ROUTES (ALL SECURED) */}
              <Route path="/home" element={<ProtectedRoute>
                <Index />
              </ProtectedRoute>} />

              <Route path="/profile/:userId" element={<ProtectedRoute>
                <Profile />
              </ProtectedRoute>} />

              <Route path="/events" element={<ProtectedRoute>
                <Events />
              </ProtectedRoute>} />

              <Route path="/groups" element={<ProtectedRoute>
                <Groups />
              </ProtectedRoute>} />

              <Route path="/groups/:groupId" element={<ProtectedRoute>
                <GroupDetails />
              </ProtectedRoute>} />

              <Route path="/directory" element={<ProtectedRoute>
                <Directory />
              </ProtectedRoute>} />

              <Route path="/friends" element={<ProtectedRoute>
                <FriendRequests />
              </ProtectedRoute>} />

              <Route path="/announcements" element={<ProtectedRoute>
                <AnnouncementPage />
              </ProtectedRoute>} />

              <Route path="/userDialog/:id" element={<ProtectedRoute>
                <UserDialog />
              </ProtectedRoute>} />

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
