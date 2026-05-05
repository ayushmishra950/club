import { useAppDispatch, useAppSelector } from "@/redux-toolkit/customHook/hook";
import { useState, useEffect } from "react";
import { setPostList } from "@/redux-toolkit/slice/postSlice";
import { getAllPost, likeAnUnLikePost, addCommentPost } from "@/services/Service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { isVideo } from "@/services/allFunctions";


const DailyInsight = ({ category, searchText }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { user } = useAuth();
  const postList = useAppSelector((state) => state?.post?.postList);

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postListRefresh, setPostListRefresh] = useState(false);


 const filteredPost = postList.filter((post) => {
  // CATEGORY FILTERING
  if (!category || category === "all") return true; // show all if no category selected

  if (category === "favorites") {
    if (!post.important) return false;
  }

  if (category === "gallerys") {
    if (!post.images?.some((img) => !isVideo(img))) return false;
  }

  if (category === "videos") {
    if (!post.images?.some((img) => isVideo(img))) return false;
  }

  if (category === "notes") {
    if (post.type !== "notes") return false;
  }

  // SEARCH FILTERING
  if (searchText && searchText !== ""  && category==="search") {
    const search = searchText.toLowerCase();
    const matchesTitle = post.title?.toLowerCase().includes(search);
    const matchesLocation = post.location?.toLowerCase().includes(search);
    if (!matchesTitle && !matchesLocation) return false;
  }

  return true; // passes all filters
});

  const handleLike = async (postId: string) => {
    try {
      let obj = { userId: user?._id, postId: postId };
      const res = await likeAnUnLikePost(obj);
      if (res.status === 200) {
        toast({ title: "Post Like Successfully.", description: res?.data?.message });
        setPostListRefresh(true);
      }
    }
    catch (err) {
      toast({ title: "Post Like Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  };

  const handleCommentClick = async (postId: string) => {
    try {
      let obj = { postId: postId, text: newComment, userId: user?._id };

      const res = await addCommentPost(obj);
      if (res.status === 200) {
        toast({ title: "Post Comment Successfully.", description: res?.data?.message });
        setPostListRefresh(true);
      }
    }
    catch (err) {
      toast({ title: "Post Comment Failed.", description: err?.response?.data?.message || err?.message, variant: "destructive" })
    }
  };

  const handleGetPost = async () => {
    try {
      const res = await getAllPost();

      if (res.status === 200) {
        dispatch(setPostList(res?.data?.posts));
        setPostListRefresh(false);
      }
    } catch (err: any) {
      console.log(err?.message);
    }
  };

  useEffect(() => {
    if (postListRefresh || postList?.length === 0) {
      handleGetPost();
    }
  }, [postListRefresh, postList?.length]);

  return (
    <div className="mt-6 text-black max-w-3xl mx-auto">
      <h1 className="text-[25px] font-bold mb-4">Daily Insights</h1>
      <div className="flex flex-col gap-6">
        {filteredPost?.map((post, index) => (
          <div
            key={post._id || index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Post Image */}
            {post.images?.slice(0, 1).map((media: string, idx: number) => {
              const isVideo = media.match(/\.(mp4|webm|ogg)$/i); // video extension check

              return isVideo ? (
                <video
                  key={idx}
                  src={media}
                  className="w-full flex-shrink-0 h-80 object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  key={idx}
                  src={media}
                  alt={`${post.title}-${idx}`}
                  className="w-full flex-shrink-0 h-60 object-cover"
                />
              );
            })}

            {/* Title & Description */}
            <div className="p-4">
              <h2 className="font-semibold text-lg">{post.title}</h2>
              <p className="text-gray-700 mt-2">{post.description}</p>
            </div>

            {/* Like & Comment Section */}
            <div className="flex justify-around border-t border-gray-200 p-2">
              <button
                className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${post?.likes?.includes(user?._id) ? "text-blue-600 font-semibold" : "text-gray-600"
                  } hover:bg-gray-100`}
                onClick={() => handleLike(post?._id)}
              >
                👍 Like {post?.likes?.length}
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100"
                onClick={() => setShowCommentInput(!showCommentInput)}
              >
                💬 Comment {post?.comments?.length}
              </button>
            </div>

            {/* Comment Input & List */}
            {showCommentInput && (
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => { setNewComment(e.target.value) }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCommentClick(post?._id);
                    }}
                  />
                  <button
                    className="text-blue-600 font-semibold px-2 py-1"
                    onClick={() => handleCommentClick(post?._id)}
                  >
                    Post
                  </button>
                </div>

                {/* List of Comments */}
                <div className="mt-2 flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {post?.comments?.map((c) => {
                    const user = c.user;

                    return (
                      <div
                        key={c._id}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-sm"
                      >
                        {/* Profile */}
                        {user?.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                            {user?.fullName?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}

                        {/* Comment text */}
                        <span>{c.text}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyInsight;