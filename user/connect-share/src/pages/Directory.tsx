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
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [view, setView] = useState<"grid" | "table">("table");
    const [skills, setSkills] = useState<string[]>([]);

    useEffect(()=>{
      socket.on("businessVerify", () => {
         handleGetAllUser();
      })
      return () => {
      socket.off("businessVerify");
      }
    },[]);

  const filtered = businesses?.filter(biz => {
    // Search filter
    const query = search.toLowerCase();
    const fieldsToCheck = [
      biz.businessName,
      biz.businessDescription,
      biz.businessAddress,
      biz.businessCategory,
      biz.ownerName
    ];

    const matchesSearch = fieldsToCheck.some(field => field?.toLowerCase().includes(query));

    // Category filter
    const matchesCategory = category === 'all' || biz.businessCategory?.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

   const handleGetAllUser = async () => {
      try {
        const res = await getAllUser();
        if (res.status === 200) {
          const allUsers = res?.data?.data || [];
          
          // Flatten all businesses from verified users/accounts
          const flattened = allUsers.reduce((acc: any[], user: any) => {
            if (user.accountType === "business" && user.businesses) {
              const verifiedBusinesses = user.businesses
                .filter((biz: any) => biz.isVerified === "verified")
                .map((biz: any) => ({
                  ...biz,
                  ownerId: user._id,
                  ownerName: user.fullName,
                  ownerEmail: user.email,
                  ownerImage: user.profileImage || user.coverImage
                }));
              return [...acc, ...verifiedBusinesses];
            }
            return acc;
          }, []);

          setBusinesses(flattened);
          
          // Extract unique categories for filter
          const uniqueCategories = [...new Set(flattened.map((b: any) => b.businessCategory).filter(Boolean))];
          setSkills(uniqueCategories as string[]);
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
        <div className="flex gap-2 mb-4">
  <button
    onClick={() => setView("table")}
    className={`px-3 py-1.5 text-sm rounded-md border ${
      view === "table"
        ? "bg-primary text-white"
        : "bg-card text-muted-foreground"
    }`}
  >
    Table
  </button>

  <button
    onClick={() => setView("grid")}
    className={`px-3 py-1.5 text-sm rounded-md border ${
      view === "grid"
        ? "bg-primary text-white"
        : "bg-card text-muted-foreground"
    }`}
  >
    Grid
  </button>
</div>

        {/* Results */}
       {view === "grid" ? (

  // ✅ GRID VIEW (same as your existing)
  <div className="grid sm:grid-cols-2 gap-4">
    {filtered?.length > 0 ? (
      filtered.map((biz, idx) => (
        <div key={biz.businessId || idx} className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
          <img src={biz?.businessCoverImage} alt="" className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="font-heading font-bold text-foreground">{biz.businessName}</h3>
            <p className="text-xs text-primary font-medium mt-0.5">{biz.businessCategory}</p>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{biz?.businessDescription}</p>

            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{biz?.businessAddress}</span>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <img src={biz?.ownerImage} alt="" className="h-6 w-6 rounded-full object-cover" />
              <span className="text-xs text-muted-foreground">
                by <span className="font-semibold text-foreground">{biz?.ownerName}</span>
              </span>
            </div>
          </div>
        </div>
      ))
    ) : ( 
       null// <EmptyState /> 
    )}
  </div>

) : (

  // ✅ TABLE VIEW
  <div className="overflow-x-auto bg-card rounded-xl shadow-card">
    <table className="w-full text-sm">
      <thead className="bg-muted/50 text-left">
        <tr>
          <th className="p-3">Business</th>
          <th className="p-3">Category</th>
          <th className="p-3">Owner</th>
          <th className="p-3">Location</th>
        </tr>
      </thead>
      <tbody>
        {filtered?.length > 0 ? (
          filtered.map((biz, idx) => (
            <tr key={biz.businessId || idx} className="border-t">
              
              <td className="p-3 flex items-center gap-2">
                <img src={biz?.businessCoverImage} className="h-10 w-10 object-cover rounded-md" />
                <span className="font-medium">{biz.businessName}</span>
              </td>

              <td className="p-3">{biz.businessCategory}</td>

              <td className="p-3">
                <div className="flex items-center gap-2">
                  <img src={biz?.ownerImage} className="h-6 w-6 rounded-full" />
                  {biz.ownerName}
                </div>
              </td>

              <td className="p-3">{biz.businessAddress}</td>

            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} className="text-center py-10 text-muted-foreground">
              No data found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

)}



      </div>
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Directory;
