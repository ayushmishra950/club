import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Home, Users, Calendar, Briefcase, MessageCircle, Megaphone, UserPlus, Menu, X, Lightbulb } from 'lucide-react';
import { useConnections } from '@/hooks/useConnections';
import socket from '@/socket/socket';
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/customHook/hook';
import { setSearchQuery } from '@/redux-toolkit/slice/searchSlice';
import { clearUnreadCount } from '@/redux-toolkit/slice/suggestionSlice';
import { SuggestionModal } from '@/components/suggestions/SuggestionModal';
import EventTicker from './EventTicker';
import appLogo from "@/assets/logo.jpg";

interface NavbarProps {
  onChatToggle: () => void;
  chatUnread: number;
}

export function Navbar({ onChatToggle, chatUnread }: NavbarProps) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [chatUnRead, setChatUnRead] = useState(0);
  const [friendUnRead, setFriendUnRead] = useState(0);
  
  // ✅ READ SUGGESTION UNREAD COUNT FROM REDUX
  const suggestionUnreadCount = useAppSelector((state) => state?.suggestion?.unreadCount);

  const [navBadges, setNavBadges] = useState<{ [key: string]: number }>({
    '/groups': 0,
    '/events': 0,
    '/directory': 0,
    '/announcements': 0,
  });

  useEffect(() => {
    if (navBadges[location.pathname] > 0) {
      setNavBadges((prev) => ({ ...prev, [location.pathname]: 0 }));
    }
  }, [location.pathname, navBadges]);

  const dispatch = useAppDispatch();

  const navItems = [
    { to: '/home', icon: Home, label: 'Feed' },
    { to: '/groups', icon: Users, label: 'Groups' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/directory', icon: Briefcase, label: 'Directory' },
    { to: '/announcements', icon: Megaphone, label: 'Announcement' },
  ];

  const isActive = (path: string) => location.pathname === path;





  useEffect(() => {
    if (user?._id) {
      socket.emit("getUnreadCount", user?._id);
      socket.emit("unSeenFriendRequest", { from: user?._id });
    }
  }, [user?._id]);

  useEffect(() => {
    socket.on("totalUnReadChat", (count) => {
      setChatUnRead(count);
    });

    socket.on("unSeenFriendRequest", (total) => {
      setFriendUnRead(total);
    });

    socket.on("friendRequestSeen", () => {
      socket.emit("unSeenFriendRequest", { from: user?._id });
    });

    const incrementBadge = (path: string) => {
      setNavBadges((prev) => {
        if (location.pathname === path) return prev;
        return { ...prev, [path]: (prev[path] || 0) + 1 };
      });
    };

    socket.on("announcement", () => incrementBadge('/announcements'));
    socket.on("newUser", () => incrementBadge('/directory'));
    socket.on("event", () => incrementBadge('/events'));
    socket.on("newGroup", () => incrementBadge('/groups'));
    socket.on("addAnRemoveUserFromGroup", () => incrementBadge('/groups'));

    return () => {
      socket.off("totalUnReadChat");
      socket.off("unSeenFriendRequest");
      socket.off("friendRequestSeen");
      socket.off("announcement");
      socket.off("newUser");
      socket.off("event");
      socket.off("newGroup");
      socket.off("addAnRemoveUserFromGroup");
    };
  }, [user?._id, location.pathname]);

  const handleSeenRequests = () => {
    socket.emit("friendRequestSeen", user?._id);
  }





  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between gap-2">
          {/* Logo */}
         <Link to="/" className="flex items-center gap-2 shrink-0">
  <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center overflow-hidden">
    <img
      src={appLogo}
      alt="Club Connect Logo"
      className="h-full w-full object-cover"
    />
  </div>
  <span className="font-heading font-bold text-lg text-foreground hidden sm:block">
    J.S.G. GLORY
  </span>
</Link>

          {/* Search */}
          <div className="hidden md:ms-2 md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                onChange={(e) => { dispatch(setSearchQuery(e.target.value)) }}
                type="text"
                placeholder="Search people, posts, events..."
                className="w-full rounded-full bg-muted py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:ms-auto md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(item.to)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="max-[1140px]:hidden">{item.label}</span>
                {navBadges[item.to] > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {navBadges[item.to]}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className='w-px h-4 hidden sm:block min-[1140px]:hidden bg-neutral-200' />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Friend Requests */}
            <Link
              to="/friends"
              onClick={handleSeenRequests}
              className={`relative p-2 rounded-full hover:bg-muted transition-colors ${isActive('/friends') ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
              <UserPlus className="h-5 w-5" />
              {friendUnRead > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {friendUnRead}
                </span>
              )}
            </Link>

            {/* Chat */}
            <button
              onClick={onChatToggle}
              className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <MessageCircle className="h-5 w-5" />
              {chatUnRead > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {chatUnRead}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setSuggestionModalOpen(true);
                  dispatch(clearUnreadCount());
                }}
                className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              >
                <Lightbulb className="h-5 w-5" />
                {suggestionUnreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {suggestionUnreadCount}
                  </span>
                )}
              </button>
              <SuggestionModal
                isOpen={suggestionModalOpen}
                onClose={() => setSuggestionModalOpen(false)}
                userId={user?._id}
              />
            </div>

            {/* Profile */}

            <div className='shrink-0 cursor-pointer' onClick={() => { navigate(`/profile/${user?._id}`) }} >
              <img
                src={user?.profileImage}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent hover:ring-primary/30 transition-all"
              />
            </div>


            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden pb-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                onChange={(e) => { dispatch(setSearchQuery(e.target.value)) }}
                type="text"
                placeholder="Search..."
                className="w-full rounded-full bg-muted py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-3 animate-fade-in border-t border-border pt-3">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive(item.to)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {navBadges[item.to] > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {navBadges[item.to]}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              to="/friends"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive('/friends')
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <UserPlus className="h-5 w-5" />
              <span>Friend Requests</span>
              {friendUnRead > 0 && (
                <span className="ml-auto h-5 w-5 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {friendUnRead}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>
      <EventTicker />
    </nav>
  );
}
