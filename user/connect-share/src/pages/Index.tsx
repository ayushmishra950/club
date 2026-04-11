import { useEffect, useState } from 'react';
import { StoriesCarousel } from '@/components/feed/StoriesCarousel';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostCard } from '@/components/feed/PostCard';
import { SuggestedUsers } from '@/components/feed/SuggestedUsers';
import { TrendingSection } from '@/components/feed/TrendingSection';
import { Navbar } from '@/components/layout/Navbar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { mockPosts, mockChats } from '@/data/mockData';
import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { setPostList } from "@/redux-toolkit/slice/postSlice";
import {getAllPost} from "@/service/post";
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const {toast} = useToast();
   const user = JSON.parse(localStorage.getItem("user"));
  const [chatOpen, setChatOpen] = useState(false);
  const [postListRefresh, setPostListRefresh] = useState(false);
  const totalUnread = mockChats.reduce((acc, c) => acc + c.unread, 0);
   const dispatch = useAppDispatch();
    const postList = useAppSelector((state)=> state?.post?.postList);
     const searchQuery = useAppSelector((state)=> state?.search?.searchQuery);

     const filteredPosts = postList.filter(post => {
  const query = searchQuery.toLowerCase();

  const postTitle = post?.title?.toLowerCase() || post?.notes?.toLowerCase() || "";
  const userName = post?.createdBy?.fullName?.toLowerCase() || post?.createdBy?.email?.toLowerCase() || "";

  return (
    postTitle.includes(query) ||
    userName.includes(query)
  );
});
const finalPosts = searchQuery ? filteredPosts : postList;


     const handleGetPosts = async () => {
        try {
            const res = await getAllPost();
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
        if(postList?.length === 0 || postListRefresh){
        handleGetPosts();
        }
    }, [postList?.length, postListRefresh])


  return (
    <div className="min-h-screen bg-background">
      <Navbar onChatToggle={() => setChatOpen(!chatOpen)} chatUnread={totalUnread} />

      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex gap-6">
          {/* Main feed */}
         <main className="flex-1 max-w-2xl mx-auto lg:mx-0">
  <StoriesCarousel />
  <CreatePost setPostListRefresh={setPostListRefresh} />

  {finalPosts?.length > 0 ? (
    finalPosts.map(post => (
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
            <div className="sticky top-20">
              <SuggestedUsers />
              <TrendingSection />
            </div>
          </aside>
        </div>
      </div>

      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Index;
