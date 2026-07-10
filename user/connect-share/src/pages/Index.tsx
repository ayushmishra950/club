import { useEffect, useState } from 'react';
import { StoriesCarousel } from '@/components/feed/StoriesCarousel';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostCard } from '@/components/feed/PostCard';
import { SuggestedUsers } from '@/components/feed/SuggestedUsers';
import { MessageSection } from '@/components/feed/MessageSection';
import { Navbar } from '@/components/layout/Navbar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { mockPosts, mockChats } from '@/data/mockData';
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setNewPost, setPostList, setRemoveUserPosts } from "@/redux-toolkit/slice/postSlice";
import { getAllPost } from "@/service/post";
import { useToast } from '@/hooks/use-toast';
import socket from '@/socket/socket';
import { Crown } from 'lucide-react';
import PaymentDialog from "@/components/forms/PaymentDialog";
import { getSingleUser } from "@/service/auth";
import { setUserData, setUpdateUser } from "@/redux-toolkit/slice/userSlice";

const Index = () => {
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user"));
  const [chatOpen, setChatOpen] = useState(false);
  const [postListRefresh, setPostListRefresh] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const totalUnread = mockChats.reduce((acc, c) => acc + c.unread, 0);
  const dispatch = useAppDispatch();
  const postList = useAppSelector((state) => state?.post?.postList);
  const searchQuery = useAppSelector((state) => state?.search?.searchQuery);
  const userData = useAppSelector((state) => state?.user?.userData);

  const currentUserData = userData || user;
  const premiumUser = currentUserData?.premiumUser === "premium";
  const showPremiumBanner = !(premiumUser || currentUserData?.paymentImage);

  // Sync user data on mount and listen to sockets
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?._id) {
        try {
          const res = await getSingleUser(user._id);
          if (res.status === 200) {
            dispatch(setUserData(res?.data?.data));
          }
        } catch (err) {
          console.error("Error fetching user data on home mount:", err);
        }
      }
    };
    fetchUserData();
  }, [dispatch, user?._id]);

  useEffect(() => {
    socket.on("paymentRequestAccepted", (data) => {
      dispatch(setUpdateUser(data));
    });

    socket.on("userUpdate", (data) => {
      dispatch(setUpdateUser(data));
    });
    socket.on("deleteUser", (user) => {
    dispatch(setRemoveUserPosts(user));
    });
    socket.on("postRefresh", (post) => {
     dispatch(setNewPost(post));
    }) 
    
   socket.on("blockUser", (data) => {
 handleGetPosts(user?._id);
});

socket.on("unblockUser", (data) => {
  console.log("Socket fired");
 handleGetPosts(user?._id);
});
    return () => {
      socket.off("paymentRequestAccepted");
      socket.off("userUpdate");
      socket.off("deleteUser");
      socket.off("postRefresh");
      socket.off("blockUser");
      socket.off("unblockUser");
    };
  }, [dispatch]);

  const pinnedAdminPosts = postList.filter((post) => post?.createdBy?.role === "admin" && post?.isPinned).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const userPosts = postList.filter(
    (post) => post?.createdBy?.role !== "admin"
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const finalPosts = [ ...pinnedAdminPosts, ...userPosts];

  const filteredPosts = finalPosts.filter(post => {
    const query = searchQuery.toLowerCase();

    const postTitle = post?.title?.toLowerCase() || post?.notes?.toLowerCase() || "";
    const userName = post?.createdBy?.fullName?.toLowerCase() || post?.createdBy?.email?.toLowerCase() || "";

    return ( postTitle.includes(query) || userName.includes(query));

  });
  const postsToRender = searchQuery ? filteredPosts : finalPosts;

  const handleGetPosts = async (userId: string) => {
      console.log("Posts fetched:", userId);
    if(!userId) return;
    try {
      const res = await getAllPost(userId);
      if (res.status === 200) {
        dispatch(setPostList(res?.data?.posts));
        setPostListRefresh(false);
      }
    }
    catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (postList?.length === 0 || postListRefresh) {
      handleGetPosts(user?._id);
    }
  }, [postList?.length, postListRefresh])

  useEffect(() => {
    socket.on("postRefresh", () => {
      handleGetPosts(user?._id);
    });

    return () => {
      socket.off("postRefresh");
    };
  }, []);


  return (
    <div className="min-h-screen bg-background">
      <Navbar onChatToggle={() => setChatOpen(!chatOpen)} chatUnread={totalUnread} />

      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex gap-6">
          {/* Main feed */}
          <main className="flex-1 max-w-2xl mx-auto lg:mx-0">
            <StoriesCarousel />
            <CreatePost setPostListRefresh={setPostListRefresh} />

            {postsToRender?.length > 0 ? (
              postsToRender.map(post => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No posts found 😕
              </div>
            )}
          </main>

          {/* Right sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-20 space-y-4">
              <SuggestedUsers />
              
              {showPremiumBanner && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 shadow-sm text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-white shadow-inner">
                      <Crown size={16} />
                    </div>
                    <h3 className="text-sm font-semibold text-yellow-700">Upgrade to Premium</h3>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    Unlock exclusive club features, priority access to events, and premium member benefits to enhance your experience.
                  </p>
                  <button onClick={() => setPaymentDialogOpen(true)} className="mt-3.5 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium py-2 rounded-lg hover:opacity-90 transition shadow-sm">
                    Go Premium
                  </button>
                </div>
              )}
              
              {/* <MessageSection /> */}
            </div>
          </aside>
        </div>
      </div>

      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      <PaymentDialog open={paymentDialogOpen} setOpen={setPaymentDialogOpen} />
    </div>
  );
};

export default Index;
