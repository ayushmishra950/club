import { useEffect, useState } from 'react';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import {  mockChats } from '@/data/mockData';
import { getAllUser } from "@/service/auth";
import socket from '@/socket/socket';


const Directory = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const totalUnread = mockChats.reduce((acc, c) => acc + c.unread, 0);
    const [users, setUsers] = useState([]);

    useEffect(()=>{
      socket.on("businessVerify", () => {
         handleGetAllUser();
      })
      return () => {
      socket.off("businessVerify");
      }
    },[]);

  const filtered = users?.filter((u)=> u?.businessVerified === true).filter(user => {
  const query = search.toLowerCase();

  // Check multiple fields
  const fieldsToCheck = [
    user.fullName,
    user.businessName,
    user.businessDescription,
    user.address,
    user.businessAddress,
    user.city,
    user.state,
    user.occupation,
    user.businessCategory,
  ];

  // Skills & hobbies are arrays, so join them to string
  if (user.skills) fieldsToCheck.push(user.skills.join(" "));
  if (user.hobbies) fieldsToCheck.push(user.hobbies.join(" "));

  // Check if any field includes the search query
  const matchesSearch = fieldsToCheck.some(field => field?.toLowerCase().includes(query));

  // Category filter (if you want)
 const matchesCategory = category === 'all' || (user.skills || []).some(skill => skill.toLowerCase() === category.toLowerCase());


  return matchesSearch && matchesCategory;
});

  const skills = [...new Set(users?.flatMap((u)=> u?.skills))];

   const handleGetAllUser = async () => {
      try {
        const res = await getAllUser();
        console.log(res);
        if (res.status === 200) {
         const businessUsers = res?.data?.data.filter(user => user.accountType === "business");
      setUsers(businessUsers);
        }
      } catch (err) {
        console.log(err);
      }
    };
  
    useEffect(() => {
      handleGetAllUser();
    }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onChatToggle={() => setChatOpen(!chatOpen)} chatUnread={totalUnread} />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Business Directory</h1>

        {/* Search & filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg bg-card border border-border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
             <button
                onClick={() => setCategory("all")}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === "all"
                    ? 'gradient-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
            {skills?.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === cat
                    ? 'gradient-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid sm:grid-cols-2 gap-4">
          {
            filtered?.length > 0 ?
          filtered.map(biz => (
            <div key={biz.id} className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
              <img src={biz?.businessCoverImage} alt="" className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-bold text-foreground">{biz.businessName}</h3>
                  <span className="flex items-center gap-1 text-sm text-yellow-500 shrink-0">
                    <Star className="h-4 w-4 fill-current" /> {biz.rating}
                  </span>
                </div>
                <p className="text-xs text-primary font-medium mt-0.5">{biz.businessCategory}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{biz?.businessDescription}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{biz?.businessAddress}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <img src={biz?.profileImage || biz?.coverImage} alt="" className="h-6 w-6 rounded-full object-cover" />
                  <span className="text-xs text-muted-foreground">by <span className="font-semibold text-foreground">{biz?.role === "admin" ? "Admin" : biz?.fullName}</span></span>
                </div>
              </div>
            </div>
          ))
          :
          <span className='ml-[100px] md:ml-[250px] mt-[120px]'>No Business Found.</span>
        }
        </div>
      </div>
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Directory;
