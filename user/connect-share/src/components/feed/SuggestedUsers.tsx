import { UserPlus, Users } from 'lucide-react';
import { users } from '@/data/mockData';
import { FriendButton } from '@/components/connections/FriendButton';
import { useConnections } from '@/hooks/useConnections';
import { getSuggestedUsers, sendRequest, acceptRequest, cancelRequest, pendingRequest, getFriendUsers } from "@/service/friendRequest";
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import socket from '@/socket/socket';
import { useToast } from '@/hooks/use-toast';

export function SuggestedUsers() {
  const {toast} = useToast();
   const user = JSON.parse(localStorage.getItem("user"));
  const { getStatus, getMutualCount } = useConnections();
  const suggestions = users.filter(u => getStatus(u.id) !== 'friends');
  const [suggestedUsers, setSuggestedUsers] = useState([]);
   const [userListRefresh, setUserListRefresh] = useState(false);

   const handleSendRequest = async (userId: string) => {
        if(!user?._id || !userId) return;
       let obj = { fromId: user?._id, toId: userId };
       try {
         const res = await sendRequest(obj);
         if (res.status === 201) {
           toast({ title: "Request Send Successfully.", description: res?.data?.message });
           socket.emit("unSeenFriendRequest", {from:user?._id, to:userId});
           setUserListRefresh(true);
         
         }
       }
       catch (err) {
         console.log(err);
         toast({ title: "Send Request Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
       }
     };

  const handleGetSuggestedUsers = async () => {
      if (!user?._id) return;
      try {
        const res = await getSuggestedUsers(user?._id);
        if (res.status === 200) {
          setSuggestedUsers(res?.data);
          setUserListRefresh(false);
        }
      } catch (err) {
        console.log(err);
      }
    };
  
    useEffect(() => {
        handleGetSuggestedUsers();
    }, [userListRefresh]);

  return (
    <div className="bg-card rounded-xl shadow-card p-4">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3">People You May Know</h3>
      <div className="space-y-3">
        {suggestedUsers?.length >0 ?
        suggestedUsers.slice(0, 4).map(user => (
          <div key={user._id} className="flex items-center gap-3">
            <img src={user?.profileImage} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Users className="h-3 w-3" /> {user?.mutualFriendsCount} mutual
              </p>
            </div>
            {/* <FriendButton user={user} size="sm" showLabel={false} /> */}
            <Button className='w-9 h-9' onClick={()=>{handleSendRequest(user?._id)}}>
              <UserPlus />
            </Button>
          </div>
        ))
        :
        <span className='text-xs text-center ml-16 mt-4'>No Suggestion Found.</span>
      }
      </div>
    </div>
  );
}
