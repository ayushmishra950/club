import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicLayout } from "@/components/PublicLayout";
import { DashboardLayout } from "@/components/DashboardLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import PublicEvents from "@/pages/PublicEvents";
import PublicAnnouncements from "@/pages/PublicAnnouncements";
import Contact from "@/pages/Contact";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import MembersPage from "@/pages/dashboard/MembersPage";
import EventsPage from "@/pages/dashboard/EventsPage";
import AnnouncementsPage from "@/pages/dashboard/AnnouncementsPage";
import ReferralsPage from "@/pages/dashboard/ReferralsPage";
import TasksPage from "@/pages/dashboard/TasksPage";
import FinancePage from "@/pages/dashboard/FinancePage";
import PaymentsPage from "@/pages/dashboard/PaymentsPage";
import AttendancePage from "@/pages/dashboard/AttendancePage";
import PollsPage from "@/pages/dashboard/PollsPage";
import PostPage from "@/pages/dashboard/PostPage";
import GroupsPage from "@/pages/dashboard/GroupsPage";
import BusinessDirectoryPage from "@/pages/dashboard/BusinessDirectoryPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import SuggestionPage from "@/pages/dashboard/SuggestionPage";
import GalleryPage from "./pages/dashboard/GalleryPage";
import ReviewPage from "./pages/dashboard/ReviewPage";
import NewsPage from "./pages/dashboard/NewsPage";
import NotFound from "@/pages/NotFound";
import socket from "./socket/socket";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const user = JSON.parse(localStorage.getItem("user"));

   useEffect(()=>{
    if(user && user?._id){
      socket.connect();
  socket.emit("joinRoom", user?._id);
    }
  }, [user]);
  
  return(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<PublicEvents />} />
            <Route path="/announcements" element={<PublicAnnouncements />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="suggestions" element={<SuggestionPage />} />
            <Route path="referrals" element={<ReferralsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="polls" element={<PollsPage />} />
            <Route path="posts" element={<PostPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="businessDirectory" element={<BusinessDirectoryPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="reviews" element={<ReviewPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
)};

export default App;
