import { useEffect, useState } from 'react';
import { Users, Lock, Globe } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { mockChats } from '@/data/mockData';
import { getAllGroups, toggleMember } from "@/service/group";
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/redux-toolkit/customHook/hook';
import { setGroupList, setGroupJoinAnUnJoin } from '@/redux-toolkit/slice/businessGroupSlice';
import { useNavigate } from 'react-router-dom';


const Groups = () => {
  const {toast} = useToast();
  const navigate = useNavigate();
   const user = JSON.parse(localStorage.getItem("user"));
  const [chatOpen, setChatOpen] = useState(false);
  const totalUnread = mockChats.reduce((acc, c) => acc + c.unread, 0);
  const [groupListRefresh, setGroupListRefresh] = useState(false);
  const dispatch = useAppDispatch();
  const groupList = useAppSelector((state)=> state?.group?.groupList);


  const toggleJoin = async(id: string) => {
    let obj = {groupId:id , userId: user?._id, fullName:user?.fullName, email:user?.email, profileImage:user?.profileImage};
    try{
        const res = await toggleMember(obj);
        if(res.status === 200){
          toast({title: "Group Join/Leave Successfully.",     description : res?.data?.message});
          dispatch(setGroupJoinAnUnJoin(obj));
        }
    }catch(err){
      console.log(err);
      toast({title:"Group Join/Leave Failed.", description:err?.response?.data?.message, variant:"destructive"})
    }
  };

  const handleGetGroups = async() => {
    try{
      const res = await getAllGroups();
      console.log(res);
      if(res.status === 200){
        dispatch(setGroupList(res?.data?.groups));
          setGroupListRefresh(false);
      }
    }catch(err){
      console.log(err);
    }
  };

  useEffect(()=>{
    if(groupListRefresh || groupList.length === 0){
    handleGetGroups();
    }
  },[groupListRefresh, groupList.length]);
 
  return (
    <div className="min-h-screen bg-background">
      <Navbar onChatToggle={() => setChatOpen(!chatOpen)} chatUnread={totalUnread} />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Groups</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          {groupList.map(group => {
           const isMember = group.members?.some( (member) => member._id === user?._id);
            return(
            <div key={group._id} className="bg-card cursor-pointer rounded-xl shadow-card overflow-hidden" onClick={() => navigate(`/groups/${group._id}`)}>
              <img src={group?.images?.[0]} alt="" className="w-full h-32 object-cover" />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading font-bold text-foreground">{group.title}</h3>
                  {group.isPrivate ? <Lock className="h-3.5 w-3.5 text-muted-foreground" /> : <Globe className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{group.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" />{group.members?.length} members</span>
                  <button
                    onClick={(e) => {e.stopPropagation();toggleJoin(group?._id)}}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isMember
                        ? 'bg-primary/10 text-primary'
                        : 'gradient-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    {isMember ? 'Joined ✓' : 'Join'}
                  </button>
                </div>
              </div>
            </div>
          )}
          )}
        </div>
      </div>
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Groups;
