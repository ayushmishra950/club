import { Plus } from 'lucide-react';
import { mockStories, currentUser } from '@/data/mockData';
import { getAllUser } from "@/service/auth";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function StoriesCarousel() {
    const [users, setUsers] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

  const handleGetAllUser = async () => {
    try {
      const res = await getAllUser();
      if (res.status === 200) {
        setUsers(res?.data?.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    handleGetAllUser();
  }, []);

  return (
    <div className="bg-card rounded-xl shadow-card p-4 mb-4">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {/* Your story */}
        <button className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="relative">
            <img src={user?.profileImage} alt="Your story" className="h-16 w-16 rounded-full object-cover" />
            {/* <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full gradient-primary flex items-center justify-center ring-2 ring-card">
              <Plus className="h-3.5 w-3.5 text-primary-foreground" />
            </div> */}
          </div>
          <span className="text-xs font-medium text-foreground">You</span>
        </button>

        {/* Other stories */}
        {users.filter(s => s._id !== user?._id).map(story => (
          <button key={story._id} className="flex flex-col items-center gap-1.5 shrink-0 group">
            <div className={`p-[2.5px] rounded-full ${story.viewed ? 'bg-muted' : 'gradient-story'}`} onClick={()=>{navigate(`/profile/${story?._id}`)}}>
              <img
                src={story?.profileImage}
                alt={story.fullName}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-card group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-xs text-muted-foreground max-w-[4.5rem] truncate">{story.fullName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
