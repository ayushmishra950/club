import { useEffect, useState } from 'react';
import { Camera, MapPin, Briefcase, Calendar, Gift, Edit2, ChevronRight, UserMinus, Users, Shield, Globe, Lock, UserPlus, LogOut } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { PostCard } from '@/components/feed/PostCard';
import { currentUser, mockPosts, mockChats, users } from '@/data/mockData';
import { useConnections } from '@/hooks/useConnections';
import { FriendButton } from '@/components/connections/FriendButton';
import { getSingleUser } from "@/service/auth";
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getSuggestedUsers, sendRequest, acceptRequest, cancelRequest, pendingRequest, getFriendUsers } from "@/service/friendRequest";
import { Button } from '@/components/ui/button';
import socket from '@/socket/socket';
import { isImage, getBirthdayInfo, personalFields } from "@/service/global";
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setPostList } from "@/redux-toolkit/slice/postSlice";
import { getAllPost } from "@/service/post";
import DeleteCard from "@/components/card/DeleteCard";


const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user"));
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'photos' | 'friends'>('posts');
  const totalUnread = mockChats.reduce((acc, c) => acc + c.unread, 0);
  const [userData, setUserData] = useState(null);
  const [friendList, setFriendList] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [userListRefresh, setUserListRefresh] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const dispatch = useAppDispatch();
  const postList = useAppSelector((state) => state?.post?.postList);
  const userPosts = postList?.filter(
    (p) => p?.createdBy?._id === userId
  );


  const isTrue = userId === user?._id;
  const birthday = getBirthdayInfo(userData?.dob);
  const allImages = postList?.filter((p) => p?.createdBy?._id === userId).flatMap(post =>
    (post.images || []).filter(url => isImage(url))
  ) || [];

  const handleLogout = () => {
    try{
      setLogoutLoading(true);
       localStorage.removeItem("user");
    navigate("/login");

    }catch(err){
      console.log(err)
    }finally{
      setLogoutLoading(false);
    }
   
  }

  const completionItems = personalFields.map(field => {
    const value = userData?.[field.key];
    return {
      label: field.label,
      done: value !== undefined && value !== null && value !== ""
    };
  });
  const completionPct = Math.round((completionItems.filter(i => i.done).length / personalFields.length) * 100);

  const tabs = ['posts', 'about', 'photos', 'friends'] as const;


  const handleGetUser = async () => {
    if (!userId) return;
    try {
      const res = await getSingleUser(userId);
      console.log(res);
      if (res.status === 200) {
        setUserData(res?.data?.data);
        setFriendList(res?.data?.friends);
      }
    }
    catch (err) {
      console.log(err);
    }
  };

  const handleGetPosts = async () => {
    try {
      const res = await getAllPost();
      if (res.status === 200) {
        dispatch(setPostList(res?.data?.posts));
      }
    }
    catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (postList?.length === 0) {
      handleGetPosts();
    }
  }, [postList?.length])

  const handleGetSuggestedUsers = async () => {
    if (!userId) return;
    try {
      const res = await getSuggestedUsers(userId);
      console.log(res);
      if (res.status === 200) {
        setSuggestedUsers(res?.data);
        setUserListRefresh(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (activeTab === "friends" || userListRefresh) {
      handleGetSuggestedUsers();
    }
  }, [activeTab, userListRefresh]);


  const handleSendRequest = async (userId: string) => {
    if (!user?._id || !userId) return;
    let obj = { fromId: user?._id, toId: userId };
    try {
      const res = await sendRequest(obj);
      if (res.status === 201) {
        toast({ title: "Request Send Successfully.", description: res?.data?.message });
        setUserListRefresh(true);
        socket.emit("unSeenFriendRequest", { from: user?._id, to: userId });
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Send Request Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  };

  const handleCancelRequest = async (userId: string) => {
    if (!userId) return;
    try {
      const res = await cancelRequest(userId);
      if (res.status === 200) {
        toast({ title: "Friend  Remove Successfully.", description: res?.data?.message });
        setUserListRefresh(true);
      }
    }
    catch (err) {
      console.log(err);
      toast({ title: "Friend Remove Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  };

  useEffect(() => {
    handleGetUser();
  }, [userId, userListRefresh]);
  console.log(userData)
  return (
    <>
      <DeleteCard
        isOpen={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        isLoading={logoutLoading}
        buttonName="Logout"
        title={`User Logout`} // Dynamic title
        description={`Are you sure you want to Logout.`} // Dynamic description
        onConfirm={handleLogout}
      />

      <div className="min-h-screen bg-background">
        <Navbar onChatToggle={() => setChatOpen(!chatOpen)} chatUnread={totalUnread} />

        {/* Cover */}
        <div className="relative h-48 sm:h-64">
          <img src={userData?.coverImage} alt="cover" className="w-full h-full object-cover" />
          {/* {isTrue &&<button className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-foreground flex items-center gap-1.5 hover:bg-card transition-colors">
    <Camera className="h-3.5 w-3.5" /> Edit Cover
  </button>} */}
        </div>

        <div className="mx-auto max-w-4xl px-4">
          {/* Profile header */}
          <div className="relative -mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-4 pb-4 border-b border-border">
            <div className="relative">
              <img src={userData?.profileImage} alt="" className="h-32 w-32 rounded-full object-cover ring-4 ring-background" />
              {/* {isTrue && <button className="absolute bottom-2 right-2 h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground">
              <Camera className="h-4 w-4" />
            </button>} */}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-heading text-2xl font-bold text-foreground">{userData?._id === user?._id ? "You" : userData?.fullName}</h1>
              <p className="text-muted-foreground text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Briefcase className="h-4 w-4" /> {userData?.occupation}
              </p>
              <p className="text-muted-foreground text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="h-4 w-4" />{userData?.address}
              </p>
              <p className="text-muted-foreground text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                <Users className="h-4 w-4" /> {friendList?.length} connections
              </p>
            </div>
            {isTrue && <><button onClick={() => { navigate(`/userDialog/${userData?._id}`) }} className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Edit2 className="h-4 w-4" /> Edit Profile
            </button>
              <button
                onClick={()=>{setLogoutDialogOpen(true)}}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-700 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>}
          </div>

          {/* Completion bar */}
          {isTrue && <div className="mt-4 bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading text-sm font-semibold text-foreground">Profile Completion</h3>
              <span className="text-sm font-semibold text-primary">{completionPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="mt-3 space-y-1">
              {completionItems.filter(i => !i.done).map(item => (
                <button key={item.label} className="w-full flex items-center justify-between rounded-lg hover:bg-muted/50 px-2 py-1.5 text-sm text-muted-foreground transition-colors">
                  <span>Add {item.label}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>}

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-border">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors relative ${activeTab === tab
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab}
                {tab === 'friends' && <span className="ml-1 text-xs text-muted-foreground">({friendList?.length})</span>}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary rounded-full" />}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="py-4">
            {activeTab === 'posts' && (
              <div className="max-w-2xl">
                {
                  userPosts?.length > 0 ? (
                    userPosts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))
                  ) : (
                    <div className="w-full flex justify-center items-center py-6 pl-8 text-sm text-muted-foreground">
                      No Posts Found.
                    </div>
                  )
                }
              </div>
            )}
            {activeTab === 'about' && (
              <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{userData?.occupation}</p>
                    <p className="text-xs text-muted-foreground">Current occupation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{userData?.address}, {userData?.city} {userData?.state}</p>
                    <p className="text-xs text-muted-foreground">Location</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Joined {new Date(userData?.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                    <p className="text-xs text-muted-foreground">Member since</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-muted-foreground" />
                  <div>
                    {birthday && (
                      <>
                        <p className="text-sm font-semibold text-foreground">
                          {birthday.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {birthday.date}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'photos' && (
              <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                {
                  allImages && allImages.length > 0 ? (
                    allImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`image-${i}`}
                        className="aspect-square object-cover hover:opacity-90 transition-opacity"
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center text-sm text-muted-foreground py-6">
                      No Images Found.
                    </div>
                  )
                }
              </div>
            )}
            {activeTab === 'friends' && (
              <div className="space-y-3">
                {friendList?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No connections yet</p>
                    <p className="text-sm mt-1">Start connecting with people to grow your network.</p>
                  </div>
                ) : (
                  friendList?.map(friend => (
                    <div key={friend?.to?._id} className="bg-card rounded-xl shadow-card p-4 flex items-center gap-4 animate-fade-in">
                      <div className="relative">
                        <img src={friend?.to?.profileImage} alt="" className="h-14 w-14 rounded-full object-cover" />
                        {friend?.to?.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-foreground">{friend?.to?.fullName}</p>
                        <p className="text-sm text-muted-foreground">{friend?.to?.occupation}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Users className="h-3 w-3" />
                          {/* {getMutualCount(friend.id)}  */}
                          mutual friends
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancelRequest(friend._id)}
                        className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <UserMinus className="h-3.5 w-3.5" /> Unfriend
                      </button>
                    </div>
                  ))
                )}

                {/* Suggested connections */}
                <div className="mt-6">
                  <h3 className="font-heading font-semibold text-sm text-foreground mb-3">People You May Know</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {suggestedUsers?.slice(0, 4).map(user => (
                      <div key={user._id} className="bg-card rounded-xl shadow-card p-4 flex items-center gap-3">
                        <img src={user.profileImage} alt="" className="h-12 w-12 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> {user?.mutualFriendsCount} mutual
                          </p>
                        </div>
                        {/* <FriendButton user={user} size="sm" showLabel={false} /> */}
                        <Button className='w-9 h-9' onClick={() => { handleSendRequest(user?._id) }}>
                          <UserPlus className='w-5 h-5' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </>
  );
};

export default Profile;
